/**
 * Rewards, Credits & Gift Voucher Marketplace View
 */

import React, { useState } from 'react';
import { User, RewardCoupon, Achievement } from '../../types';
import { storageService } from '../../services/storageService';
import { RewardService } from '../../services/rewardService';
import confetti from 'canvas-confetti';
import {
  Award,
  Flame,
  Gift,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  Clock,
  TrendingUp,
  Tag,
} from 'lucide-react';

interface RewardsStoreViewProps {
  user: User;
}

export const RewardsStoreView: React.FC<RewardsStoreViewProps> = ({ user }) => {
  const studentId = user.studentId || '101';
  const [rewardProfile, setRewardProfile] = useState(storageService.getRewardProfile(studentId));
  const coupons = storageService.getCoupons();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRedeem = (couponId: string) => {
    const res = RewardService.redeemCoupon(studentId, couponId);
    if (res.success) {
      setRewardProfile(storageService.getRewardProfile(studentId));
      setFeedbackMessage({ type: 'success', text: res.message });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else {
      setFeedbackMessage({ type: 'error', text: res.message });
    }

    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Gamified Incentive Engine
              </span>
              <span className="text-xs text-slate-400">Real-World Partner Vouchers</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Gift className="h-7 w-7 text-amber-400" />
              <span>Rewards & Voucher Marketplace</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Earn credits automatically by completing tests (+20), scoring high (+30), and mastering weak concepts (+50). Redeem instantly for Amazon, Flipkart, Swiggy, and movie vouchers.
            </p>
          </div>

          {/* Balance Pill */}
          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-5 shrink-0 shadow-lg text-right">
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
              Available Balance
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 flex items-center justify-end gap-1.5 mt-1">
              <Award className="h-7 w-7" />
              <span>{rewardProfile.availableCredits}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-end gap-1">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span>{rewardProfile.currentStreakDays}-Day Learning Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Notification */}
      {feedbackMessage && (
        <div
          className={`rounded-2xl p-4 text-xs sm:text-sm font-semibold border flex items-center justify-between ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-xs opacity-80 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Gift Vouchers Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-amber-400" />
            <span>Available Gift Cards & Coupons</span>
          </h3>
          <span className="text-xs text-slate-400">Instant Verification Codes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map(coupon => {
            const canAfford = rewardProfile.availableCredits >= coupon.costCredits;

            return (
              <div
                key={coupon.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 hover:border-slate-700 transition space-y-4 shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {coupon.partner}
                    </span>
                    <span className="text-lg font-extrabold text-white">₹{coupon.valueINR}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{coupon.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">Valid across {coupon.partner} online and app purchases.</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Cost:</span>
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      {coupon.costCredits} Credits
                    </span>
                  </div>

                  <button
                    disabled={!canAfford}
                    onClick={() => handleRedeem(coupon.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow ${
                      canAfford
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Tag className="h-3.5 w-3.5" />
                    <span>{canAfford ? `Redeem ₹${coupon.valueINR} Voucher` : `Need ${coupon.costCredits - rewardProfile.availableCredits} More Credits`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Redeemed History & Codes */}
      {rewardProfile.redeemedCoupons.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">My Active Redeemed Vouchers</h3>
            <span className="text-xs text-slate-400">{rewardProfile.redeemedCoupons.length} Claimed</span>
          </div>

          <div className="space-y-3">
            {rewardProfile.redeemedCoupons.map((c, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-slate-950 p-4 border border-slate-800"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{c.title} (₹{c.valueINR})</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      Active
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Redeemed on {new Date(c.redeemedAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30">
                    {c.code}
                  </span>
                  <button
                    onClick={() => c.code && copyToClipboard(c.code)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  >
                    {copiedCode === c.code ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements Showcase */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Award className="h-4 w-4 text-indigo-400" />
          <span>Academic Milestones & Badges</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {rewardProfile.achievements.map(ach => (
            <div
              key={ach.id}
              className={`rounded-xl border p-4 space-y-2 transition ${
                ach.isUnlocked
                  ? 'border-indigo-500/40 bg-indigo-950/20'
                  : 'border-slate-800 bg-slate-950 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{ach.icon}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    ach.isUnlocked
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {ach.isUnlocked ? 'Unlocked' : 'In Progress'}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{ach.description}</p>
              </div>
              <div className="text-[10px] font-semibold text-amber-400">
                Reward: +{ach.creditsReward} Credits
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
