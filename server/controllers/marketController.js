const axios = require('axios');

const getMarketRates = async (req, res) => {
    try {
        const apiKey = process.env.MARKET_RATES_API_KEY || "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";

        if (!apiKey) {
            console.error("API Key missing in server environment variables");
            return res.status(500).json({ message: "Server configuration error: API Key missing" });
        }

        const baseUrl = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

        console.log("Incoming query:", JSON.stringify(req.query, null, 2));

        // Use a simple custom serializer or manual string construction
        // We need: filters[state]=Punjab (NOT filters%5Bstate%5D=Punjab)

        const params = [];
        params.push(`api-key=${apiKey}`);
        params.push(`format=${req.query.format || 'json'}`);
        params.push(`limit=${req.query.limit || '100'}`);

        if (req.query.filters && typeof req.query.filters === 'object') {
            for (const [key, value] of Object.entries(req.query.filters)) {
                // Manually construct without encoding brackets, but encode value
                params.push(`filters[${key}]=${encodeURIComponent(value)}`);
            }
        }

        // Forward other top-level params (filtering out known ones)
        for (const [key, value] of Object.entries(req.query)) {
            if (key !== 'filters' && key !== 'format' && key !== 'limit' && key !== 'api-key') {
                params.push(`${key}=${encodeURIComponent(value)}`);
            }
        }

        const queryString = params.join('&');
        const url = `${baseUrl}?${queryString}`;

        console.log(`Proxying request to: ${url}`);

        const response = await axios.get(url);
        res.json(response.data);

    } catch (error) {
        console.error("Error in getMarketRates:", error.message);
        if (error.response) {
            console.log("Upstream status:", error.response.status);
            console.log("Upstream data:", JSON.stringify(error.response.data));
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            res.status(504).json({ message: "No response from upstream server" });
        } else {
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
};

module.exports = { getMarketRates };
