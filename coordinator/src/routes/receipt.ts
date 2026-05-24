import { Router } from "express";
import { supabase } from "../supabase";
import { requireAuth } from "../middleware/auth";

const router = Router();

const SETTLEMENT = process.env.SETTLEMENT_CONTRACT_ADDRESS!;
const CHAIN_ID   = Number(process.env.CHAIN_ID || 8453);

// GET /v1/receipt-calldata?scrapLotId=...
router.get("/", requireAuth, async (req, res) => {
  const miner = ((req as any).miner as string).toLowerCase();
  const lotId = req.query.crudeLotId as string || req.query.scrapLotId as string;

  if (!lotId) { res.status(400).json({ error: "Missing scrapLotId" }); return; }

  const { data: lot } = await supabase
    .from("scrap_lots")
    .select("*")
    .eq("id", lotId)
    .eq("miner", miner)
    .single();

  if (!lot) { res.status(404).json({ error: "Lot not found" }); return; }
  if (lot.status !== "ready") {
    res.status(425).json({
      error:       "Lot not ready yet",
      status:      lot.status,
      availableAt: lot.available_at,
    });
    return;
  }

  res.json({
    scrapLotId:  lot.id,
    crudeLotId:  lot.id,
    receipt: {
      miner:       lot.miner,
      epochId:     lot.epoch_id,
      siteId:      lot.site_id,
      challengeId: lot.challenge_id,
      credits:     lot.credits,
      solveIndex:  lot.solve_index,
      nonce:       lot.nonce,
    },
    signature: lot.signature,
    transaction: {
      to:      SETTLEMENT,
      chainId: CHAIN_ID,
      value:   "0",
      data:    lot.calldata,
    },
  });
});

export default router;
