import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
    name: "weather-mcp-server",
    version: "1.0.0",
});

server.tool(
    "get-weather",
    "tool to get weather for a city",
    {
        city: z.string().describe("name of the city to get weather for"),
    },
    async ({ city }) => {
        //get latitude and longitude of city
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`
        );
        const data = await response.json();
        const { latitude, longitude } = data.results[0];
        if (data.results.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `city ${city} not found`,
                    },
                ],
            };
        }
        //get weather of city

        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&current=temperature_2m,relative_humidity_2m,precipitation,rain,cloud_cover`)
        const weatherData = await weatherResponse.json()

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(weatherData,null,2),
                },
            ],
        };
    }
);

const transport = new StdioServerTransport();
server.connect(transport);
