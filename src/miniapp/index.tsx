import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import queryString from 'query-string'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const publicDir = path.join(__dirname, '../..', 'public')

export const miniApp = new Frog({
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: 'anky',
})

miniApp.composerAction(
    '/',
    (c) => {
      return c.res({
        title: 'anky',
        url: 'https://poiesis.anky.bot/composer' 
      })
    },
    {
      name: 'anky',
      description: 'just write',
      icon: 'image',
      imageUrl: 'https://github.com/jpfraneto/images/blob/main/vibezz.jpeg?raw=true',
    }
  )

  const SESSION_FILE = path.join(publicDir, 'sessions.json');

  miniApp.frame("/session/:id", async (c) => {
      const { id } = c.req.param()
      console.log("the id is: ", id)
  
      // Read the sessions file
      let sessions = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
  
      // Get the session data
      const sessionData = sessions[id];
      console.log("the session adata is: ", sessionData)
  
      if (!sessionData) {
          return c.res({
              image: (
                  <div style={{
                      alignItems: 'center',
                      backgroundColor: "black",
                      backgroundSize: '100% 100%',
                      display: 'flex',
                      flexDirection: 'column',
                      flexWrap: 'nowrap',
                      height: '100%',
                      justifyContent: 'center',
                      textAlign: 'center',
                      width: '100%',
                  }}>
                      <div style={{
                          color: 'white',
                          fontSize: 40,
                          fontStyle: 'normal',
                          letterSpacing: '-0.025em',
                          lineHeight: 1.4,
                          marginTop: 30,
                          padding: '0 120px',
                          whiteSpace: 'pre-wrap',
                      }}>
                          Session not found
                      </div>
                  </div>
              ),
              intents: [
                  <Button value="back">Go Back</Button>,
              ],
          })
      }
  
      const shareQs = queryString.stringify({
        text: ``,
        "embeds[]": `https://poiesis.anky.bot/miniapp/session/${id}`
      })

      const warpcastRedirectLink = `https://www.warpcast.com/~/compose?${shareQs}`

      return c.res({
          image: (
              <div style={{
                  alignItems: 'center',
                  backgroundColor: "black",
                  backgroundSize: '100% 100%',
                  display: 'flex',
                  flexDirection: 'column',
                  flexWrap: 'nowrap',
                  height: '100%',
                  justifyContent: 'center',
                  textAlign: 'center',
                  width: '100%',
              }}>
                  <div style={{
                      color: 'white',
                      fontSize: 48,
                      fontStyle: 'normal',
                      letterSpacing: '-0.025em',
                      lineHeight: 1.4,
                      marginTop: 30,
                      padding: '0 60px',
                      whiteSpace: 'pre-wrap',
                  }}>
                    
                     {sessionData.responseFromAnky.inquiry}
                  </div>
              </div>
          ),
          intents: [
              <Button.Link href={warpcastRedirectLink}>Share Inquiry</Button.Link>,
          ],
      })
  })