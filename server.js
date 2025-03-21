import express from "express";
import axios from "axios";
import dotenv from "dotenv";

// Cargar variables de entorno desde .env
dotenv.config();

const apiKey = process.env.DEEPSEEK_API_KEY;
const endpoint = "https://api.deepseek.com/v1/chat/completions";
const app = express();
const port = process.env.PORT || 3000;

// Función que envía la pregunta a DeepSeek y retorna la respuesta
async function askDeepSeek(question) {
  // Modificar la consulta para pedir explícitamente respuestas breves pero precisas
  const promptWithInstruction = `Por favor, responde a la siguiente pregunta de manera breve pero precisa (en máximo 2-3 oraciones concisas): ${question}`;
  
  const response = await axios.post(
    endpoint,
    {
      model: "deepseek-chat",
      messages: [{ role: "user", content: promptWithInstruction }],
      // Limitar el número máximo de tokens en la respuesta
      max_tokens: 150,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );
  
  const result = response.data;
  return result.choices[0].message.content;
}

// Endpoint para realizar consultas generales
app.get('/ask', async (req, res) => {
  const question = req.query.question;
  if (!question) {
    return res.status(400).json({ error: 'Se requiere una pregunta en el parámetro "question"' });
  }
  try {
    let answer = await askDeepSeek(question);
    // Ya no truncamos la respuesta, la enviamos completa
    res.json({ response: answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la respuesta' });
  }
});

// Levantar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});