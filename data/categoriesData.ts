export const categoriesData = {
  dev: {
    title: 'Development',
    description: 'Software engineering, tech stacks, and coding experiences.',
    color: '#3b82f6', // blue
    icon: 'Terminal',
  },
  travel: {
    title: 'Travel',
    description: 'Journeys around the world, tips, and photo stories.',
    color: '#10b981', // emerald
    icon: 'Plane',
  },
  hobby: {
    title: 'Hobby',
    description: 'Photography, cooking, and various personal interests.',
    color: '#f59e0b', // amber
    icon: 'Heart',
  },
  life: {
    title: 'Life',
    description: 'Daily reflections, thoughts, and personal growth.',
    color: '#ec4899', // pink
    icon: 'Coffee',
  },
};

export type CategoryKey = keyof typeof categoriesData;
