/*
  Warnings:

  - A unique constraint covering the columns `[userId,channelId]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_channelId_key" ON "subscriptions"("userId", "channelId");
