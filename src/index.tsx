import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { miniApp } from './miniapp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getResponseFromWriting } from './utils/ai'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const publicDir = path.join(__dirname, '..', 'public')

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

export const app = new Frog({
  title: 'anky',
})

app.use('/*', serveStatic({ root: './public' }))

// ****** ROUTES *********
app.route("/miniapp", miniApp)

app.get("/", async (c) => {
  return c.json({123:456})
})

// New route to serve the composer HTML file
app.get("/composer", async (c) => {
  return c.html(fs.readFileSync(path.join(__dirname, '../public/templates', 'miniapp.html'), 'utf-8'))
})

const SESSION_FILE = path.join(publicDir, 'sessions.json');

// Initialize the sessions file if it doesn't exist
if (!fs.existsSync(SESSION_FILE)) {
    fs.writeFileSync(SESSION_FILE, '{}');
}

app.post("/end-session", async (c) => {
    const { text, sessionDuration, sessionId } = await c.req.json()

    let fid = 16098; // You might want to generate this dynamically
    const responseFromAnky = await getResponseFromWriting(fid, text, sessionDuration)

    const sessionData = {
        text,
        sessionDuration,
        responseFromAnky,
        timestamp: Date.now()
    };

    // Read the current sessions
    let sessions = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));

    // Add the new session
    sessions[sessionId] = sessionData;

    // Write the updated sessions back to the file
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2));

    return c.json({ success: true, sessionId, responseFromAnky })
});


app.frame('/', (c) => {
  const { buttonValue, inputText, status } = c
  const fruit = inputText || buttonValue
  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background:
            status === 'response'
              ? 'linear-gradient(to right, #432889, #17101F)'
              : 'black',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 60,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {status === 'response'
            ? `Nice choice.${fruit ? ` ${fruit.toUpperCase()}!!` : ''}`
            : 'Welcome!'}
        </div>
      </div>
    ),
    intents: [
      <TextInput placeholder="Enter custom fruit..." />,
      <Button value="apples">Apples</Button>,
      <Button value="oranges">Oranges</Button>,
      <Button value="bananas">Bananas</Button>,
      status === 'response' && <Button.Reset>Reset</Button.Reset>,
    ],
  })
})

const port = 3008
console.log(`Server is running on port ${port}`)

devtools(app, { serveStatic })

serve({
  fetch: app.fetch,
  port,
})