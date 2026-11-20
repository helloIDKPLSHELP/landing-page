// Environmental facts shown in the fact panel next to the stress ball.
const BALLOON_FACTS = [
  'Released balloons eventually return to land or water as litter.',
  'Wildlife can mistake brightly coloured balloon fragments for food.',
  'Swallowed balloon pieces can cause injury, digestive blockage, malnutrition, or starvation.',
  'Strings and ribbons can entangle birds, turtles, and other wildlife.',
  'Sea turtles may mistake floating balloon debris for familiar prey.',
  'Shiny metallic balloon fragments can resemble food when they drift through water.',
  'Wind and waterways can carry balloon debris far from where it was released.',
  'Keeping balloons contained and disposing of them responsibly helps prevent wildlife harm.',
]

export const BALLOON_FACT_EVENT = 'uplift:balloon-fact'

let currentFactIndex = 0

// Advance to the next fact and tell the page about it.
export function showNextBalloonFact() {
  currentFactIndex = (currentFactIndex + 1) % BALLOON_FACTS.length
  window.dispatchEvent(new CustomEvent(BALLOON_FACT_EVENT, { detail: { index: currentFactIndex } }))
}

export default BALLOON_FACTS
