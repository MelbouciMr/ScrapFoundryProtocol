import * as https from "https";

// Steel HRC (Hot-Rolled Coil) price in USD per metric ton
// Multiplier bands matching SCRAP lore

export interface OracleResult {
  priceUsdPerTon: number;
  multiplier: number;
  band: string;
  fetchedAt: string;
  source: string;
}

const BANDS = [
  { max: 400,  multiplier: 0.5,  label: "CRITICAL LOW"  },
  { max: 550,  multiplier: 0.75, label: "DEPRESSED"      },
  { max: 700,  multiplier: 1.0,  label: "BASELINE"       },
  { max: 850,  multiplier: 1.25, label: "ELEVATED"       },
  { max: Infinity, multiplier: 1.5, label: "SURGE"       },
];

function getMultiplier(price: number): { multiplier: number; band: string } {
  for (const b of BANDS) {
    if (price < b.max) return { multiplier: b.multiplier, band: b.label };
  }
  return { multiplier: 1.5, band: "SURGE" };
}

// Helper function to make HTTPS requests
function httpsGet(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 10000 }, (res) => {
      let data = "";
      
      res.on("data", (chunk) => {
        data += chunk;
      });
      
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error("Failed to parse JSON"));
        }
      });
    });
    
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

// Cache to avoid hammering the API
let _cache: OracleResult | null = null;
let _cacheExpiry = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function getSteelPrice(): Promise<OracleResult> {
  if (_cache && Date.now() < _cacheExpiry) return _cache;

  try {
    // Primary: World Bank Commodities API (FREE, no API key required)
    // Steel, Hot Rolled Coil (HRC) - Monthly average USD per metric ton
    const worldBankUrl = "https://api.worldbank.org/v2/en/indicator/PSTLWRLDUSDM?downloadformat=json";
    
    const data = await httpsGet(worldBankUrl);

    // World Bank returns: [metadata, data_array]
    // data_array[0] is most recent month
    if (data && Array.isArray(data) && data[1]?.length > 0) {
      const latestData = data[1][0];
      const price = latestData.value;

      if (price && !isNaN(price)) {
        const { multiplier, band } = getMultiplier(price);

        _cache = {
          priceUsdPerTon: Math.round(price),
          multiplier,
          band,
          fetchedAt: new Date().toISOString(),
          source: "worldbank",
        };
        _cacheExpiry = Date.now() + CACHE_TTL_MS;
        return _cache;
      }
    }

    // Fallback 1: Alpha Vantage (if API key is set)
    const alphaKey = process.env.ALPHA_VANTAGE_KEY;
    if (alphaKey && alphaKey !== "your_alpha_vantage_key") {
      // Use COPPER as proxy (correlation ~0.85 with steel)
      // Historical ratio: Steel ≈ Copper * 0.12
      const alphaUrl = `https://www.alphavantage.co/query?function=COMMODITY&symbol=COPPER&interval=monthly&apikey=${alphaKey}`;
      
      try {
        const alphaData = await httpsGet(alphaUrl);
        
        if (alphaData?.data?.[0]?.value) {
          const copperPrice = parseFloat(alphaData.data[0].value);
          const estimatedSteel = copperPrice * 0.12 * 1000; // Convert to per metric ton
          const { multiplier, band } = getMultiplier(estimatedSteel);

          _cache = {
            priceUsdPerTon: Math.round(estimatedSteel),
            multiplier,
            band,
            fetchedAt: new Date().toISOString(),
            source: "alphavantage-copper-proxy",
          };
          _cacheExpiry = Date.now() + CACHE_TTL_MS;
          return _cache;
        }
      } catch (alphaErr) {
        // eslint-disable-next-line no-console
        console.warn("[ORACLE] Alpha Vantage fallback failed", alphaErr);
      }
    }

  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[ORACLE] Failed to fetch steel price from APIs, using fallback baseline", err);
  }

  // Hard fallback — baseline price when all APIs fail
  _cache = {
    priceUsdPerTon: 620,
    multiplier: 1.0,
    band: "BASELINE",
    fetchedAt: new Date().toISOString(),
    source: "fallback",
  };
  _cacheExpiry = Date.now() + 15 * 60 * 1000; // 15 min fallback cache
  return _cache;
}