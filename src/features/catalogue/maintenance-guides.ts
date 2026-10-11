export const maintenanceGuides = {
  "ac-maintenance": {
    title: "AC maintenance: what to check before booking a service",
    description: "Simple AC care checks, symptoms to share with a technician and how to choose an appropriate AC service package in Chennai.",
    servicePath: "/ac-service-chennai", serviceLabel: "Compare AC service packages in Chennai",
    sections: [
      { title: "Start with the manufacturer's instructions", body: "Follow your model's cleaning schedule and safe shutdown instructions. Keep the indoor unit's airflow unobstructed. Only clean user-accessible filters as directed by the manufacturer; do not open electrical panels or refrigerant connections." },
      { title: "Describe the symptom, not an assumed repair", body: "When booking, say whether cooling is weak, water is leaking or the unit makes unusual noise. Note when the problem began and share the AC type and model. These details help the technician plan an inspection; they do not establish that a gas refill is needed." },
      { title: "Compare cleaning, inspection and installation separately", body: "Read the live package inclusions before booking. Cleaning is not the same as repairing a fault, and installation or removal may require a different package. Confirm any additional work and parts quote before approving it." },
      { title: "When to stop using the unit", body: "If you notice a burning smell, sparks or repeated electrical tripping, stop using the appliance and arrange professional help. Do not attempt electrical repairs yourself." },
    ],
  },
  "washing-machine-care": {
    title: "Washing machine care: preparing for an inspection",
    description: "Practical washing machine care and information to prepare when booking an inspection for drainage, spinning or starting problems.",
    servicePath: "/washing-machine-repair-chennai", serviceLabel: "Compare washing machine repair in Chennai",
    sections: [
      { title: "Use the care instructions for your model", body: "Follow the manufacturer’s load limits, detergent guidance and drum-cleaning instructions. Check accessible hoses visually for leaks, without disconnecting parts or opening the machine. Keep the surrounding floor dry." },
      { title: "Record the problem before the visit", body: "Note any displayed error code and whether the problem occurs during filling, washing, draining or spinning. Share the brand, model and whether it is front-load or top-load when booking. Do not repeat a cycle if it causes leaking or electrical tripping." },
      { title: "Read inspection and repair inclusions", body: "Check the current inspection price and included work. Inspection does not necessarily include replacement parts or every repair. Ask for the diagnosis and any additional quote before authorising work." },
      { title: "Avoid do-it-yourself electrical repairs", body: "For burning smells, sparks or electrical faults, stop using the machine and seek professional help. Follow the manufacturer’s safe isolation instructions; do not access internal wiring or bypass safety switches." },
    ],
  },
} as const;

export function getMaintenanceGuide(slug: string) {
  return Object.hasOwn(maintenanceGuides, slug) ? maintenanceGuides[slug as keyof typeof maintenanceGuides] : null;
}
