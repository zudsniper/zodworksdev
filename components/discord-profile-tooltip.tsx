import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Flame, CheckCircle, Code, Gem, Hash, Smile } from "lucide-react"
import Image from "next/image"

// Placeholder data - in a real app, this would be dynamic
const profileData = {
  bannerUrl: "https://cdn.discordapp.com/banners/260934923261706260/a_a32dfa0730424b29f265a59c1dd14c8f?size=4096",
  avatarUrlLight: "https://cdn.discordapp.com/avatars/260934923261706260/f6a1f4b5cbdcdcd6d6e93371088d0aea?size=1024",
  avatarUrlDark: "https://cdn.discordapp.com/avatars/260934923261706260/f6a1f4b5cbdcdcd6d6e93371088d0aea?size=1024",
  name: "zod",
  username: "zudsniper",
  statusEmoji: <Smile className="h-4 w-4 text-orange-400" />, // Placeholder
  badges: [
    { icon: <Flame className="h-3 w-3" />, label: "LTF", color: "bg-orange-500 text-white" },
    { icon: <CheckCircle className="h-3 w-3" />, label: "Verified", color: "bg-teal-500 text-white" },
    { icon: <Code className="h-3 w-3" />, label: "Dev", color: "bg-gray-700 text-green-400" },
    { icon: <Gem className="h-3 w-3" />, label: "Supporter", color: "bg-pink-500 text-white" },
    { icon: <Hash className="h-3 w-3" />, label: "Tag", color: "bg-gray-300 text-gray-700" },
  ],
}

interface DiscordProfileTooltipProps {
  theme?: "light" | "dark"
}

export default function DiscordProfileTooltip({ theme = "dark" }: DiscordProfileTooltipProps) {
  return (
    <div className="w-[300px] rounded-lg shadow-lg overflow-hidden bg-discord-profile-blue text-discord-profile-text">
      {/* Banner Image */}
      <div className="h-[60px] relative">
        <Image src={profileData.bannerUrl || "/placeholder.svg"} alt="Profile banner" layout="fill" objectFit="cover" />
      </div>

      {/* Avatar and Custom Status */}
      <div className="relative px-3">
        <div className="absolute -top-[32px] flex items-end">
          <div className="relative rounded-full border-4 border-discord-profile-blue bg-discord-profile-blue">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={theme === "dark" ? profileData.avatarUrlDark : profileData.avatarUrlLight}
                alt={profileData.name}
              />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {profileData.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Status Indicator */}
            <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-discord-status-green border-2 border-discord-profile-blue" />
          </div>
          {/* Custom Status Emoji - simplified */}
          <div className="ml-2 mb-1 flex h-7 w-7 items-center justify-center rounded-md bg-background/80 backdrop-blur-sm border border-border/50 shadow-sm">
            {profileData.statusEmoji}
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="pt-10 px-3 pb-3 space-y-1">
        <h3 className="text-xl font-bold text-discord-profile-text">{profileData.name}</h3>
        <div className="flex items-center space-x-1.5">
          <p className="text-xs text-discord-profile-username">{profileData.username}</p>
          {profileData.badges.map((badge, index) => (
            <span
              key={index}
              className={`flex items-center space-x-0.5 px-1 py-0.5 rounded-sm text-xs font-medium ${badge.color}`}
              title={badge.label}
            >
              {badge.icon}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
