import type { IconType } from 'react-icons';
import * as Si from 'react-icons/si';
import { Code2 } from 'lucide-react';

const alias: Record<string, string> = {
  js: 'javascript', ts: 'typescript', 'node': 'nodedotjs', 'node.js': 'nodedotjs', nodejs: 'nodedotjs',
  'next.js': 'nextdotjs', nextjs: 'nextdotjs', 'vue.js': 'vuedotjs', vue: 'vuedotjs', 'express.js': 'express',
  'c++': 'cplusplus', 'c#': 'csharp', css: 'css3', css3: 'css', html: 'html5', postgres: 'postgresql',
  'react native': 'react', 'tailwind css': 'tailwindcss', tailwind: 'tailwindcss', 'telegram bot': 'telegram',
  'socket.io': 'socketdotio', 'three.js': 'threedotjs', aws: 'amazonwebservices', 'nest.js': 'nestjs',
  'nuxt.js': 'nuxtdotjs', golang: 'go', 'shadcn/ui': 'shadcnui', 'material ui': 'mui', 'd3.js': 'd3dotjs',
};
const map = new Map<string, IconType>();
for (const [k, v] of Object.entries(Si)) if (k.startsWith('Si')) map.set(k.slice(2).toLowerCase(), v as IconType);

const key = (s: string) => s.toLowerCase().replace(/[\s\-_]/g, '').replace(/\./g, 'dot').replace(/\+/g, 'plus').replace(/#/g, 'sharp');

export function getSkillIcon(name: string): IconType {
  const n = name.trim().toLowerCase();
  const a = alias[n];
  return (a && (map.get(a) || map.get(key(a)))) || map.get(key(n)) || map.get(n.replace(/[^a-z0-9]/g, '')) || (Code2 as unknown as IconType);
}
