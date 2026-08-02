import { ButtonHTMLAttributes } from "react";

export interface ChannelCardProps {
  channelTitle: string;
  channelAvatar?: string;
  subscriberCount?: number | string;
  isSubscribed?: boolean;
  onSubscribe?: () => void;
  subscribeButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
}
