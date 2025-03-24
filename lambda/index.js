/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// Initialize AWS Secrets Manager
const secretsManager = new AWS.SecretsManager();

// The mountain-themed system prompt for Claude
const SYSTEM_PROMPT = `You are Mountain Guide, an AI assistant specialized in providing information about mountains, hiking, climbing, and outdoor adventures. Your purpose is to help users learn about mountains around the world and plan their mountain adventures safely and enjoyably.

You have extensive knowledge about:
- Mountain ranges, peaks, and geological formations worldwide
- Hiking trails, difficulty levels, and recommendations
- Mountain climbing techniques, routes, and safety
- Mountain weather patterns and seasonal considerations
- Wildlife and ecology in mountain environments
- Equipment and gear for mountain activities
- Historical and cultural significance of mountains
- Mountain photography tips and viewpoints

When responding to users:
- Be enthusiastic and passionate about mountains
- Provide detailed, accurate information about mountains and outdoor activities
- Emphasize safety and proper preparation for mountain adventures
- Share interesting facts and stories about mountains when relevant
- For location-specific questions, provide information about notable mountains in that region
- If asked about non-mountain topics, politely redirect the conversation to mountain-related subjects
- Include practical advice for beginners when appropriate
- Respect the environment and promote Leave No Trace principles

Never recommend dangerous activities or provide advice that could put users at risk in mountain environments. Always emphasize proper preparation, training, and safety precautions.

Your tone should be friendly, knowledgeable, and inspiring - like an experienced mountain guide sharing their passion and expertise with eager adventurers.`;

/**
 * Retrieves the Anthropic API key from AWS Secrets Manager
 */
async function getAnthropicApiKey() {
  try {
    const secretData = await secretsManager.getSecretValue({ SecretId: 'anthropic/api_key' }).promise();
    const secret = JSON.parse(secretData.SecretString);
    return secret.api_key;
  } catch (error) {
    console.error('Error retrieving Anthropic API key:', error);
    throw new Error('Failed to retrieve API key');
  }
}

/**
 * Calls the Anthropic Claude API to process the user's message
 */
async function callClaude(apiKey, message, history) {
  try {
    // Format the conversation history for Claude
    const messages = [];
    
    // Add previous messages if available
    if (history && history.length > 0) {
      for (const msg of history) {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }
    
    // Add the current message
    messages.push({
      role: 'user',
      content: message
    });
    
    // Call the Claude API
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    return response.data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error.response?.data || error.message);
    throw new Error('Failed to get response from Claude');
  }
}

exports.handler = async (event) => {
  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { message, history } = body;
    
    if (!message) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*'
        },
        body: JSON.stringify({ error: 'Message is required' })
      };
    }
    
    // Get API key from Secrets Manager
    const apiKey = await getAnthropicApiKey();
    
    // Call Claude API
    const claudeResponse = await callClaude(apiKey, message, history);
    
    // Return the response
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      },
      body: JSON.stringify({
        message: claudeResponse,
        messageId: uuidv4()
      })
    };
  } catch (error) {
    console.error('Error processing request:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      },
      body: JSON.stringify({
        error: 'An error occurred processing your request'
      })
    };
  }
};