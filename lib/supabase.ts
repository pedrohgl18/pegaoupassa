// This file is a facade (barrel file) to maintain backward compatibility
// Logic has been moved to services/ directory

export { supabase, isNative } from './services/supabase.client'
export { auth } from './services/auth.service'
export { profiles, photos } from './services/profile.service'
export { swipes, matches } from './services/interaction.service'
export { messages, messageReactions } from './services/message.service'
export { interests, reports, safety, zodiac, boosts } from './services/utility.service'
export { pushNotifications } from './services/notification.service'
