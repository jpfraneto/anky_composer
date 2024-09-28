

import axios from 'axios'

export async function getResponseFromWriting(fid:number, writing: string, duration: number) {
    try {
        const payload = {
            model: "llama3.1",
            prompt: `you are a reincarnation of ramana maharshi and your mission is to practice self inquiry with a human being. for that, you are going to receive a piece of writing that that person wrote, and your mission is to reply to this message with only ONE inquiry to that user. the idea is that you use what the user wrote to trigger her or him, and that you writte an inquiry that is directed directly to the true self of the user. reply with a json object that has two properties:
            
            reasoning: why did you choose that inquiry,
            inquiry: the inquiry for the user`,
            stream: false,
            format: "json"
        };
        
        const response = await axios.post('http://localhost:11434/api/generate', payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log("the response from ollama is ", response.data)
        const jsonParsed = JSON.parse(response.data.response)
        console.log(jsonParsed)
        return jsonParsed
    } catch (error) {
      // call openais api if this fials
      return {
        inquiry: "tell us who you are",
        reasoning: "because that's the inquiry"
      }
    }
  }