import { Link } from 'react-router-dom';
import { BedDouble, ChevronRight, HandHeart, Moon, Plane, ShieldCheck, Sun, Utensils, Heart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageHead } from '../components/PageHead';
import { DUA_CATEGORIES } from '../content/duas';
import '../styles/duas.css';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  morning: Sun,
  evening: Moon,
  'after-salah': HandHeart,
  sleep: BedDouble,
  eating: Utensils,
  travel: Plane,
  protection: ShieldCheck,
  general: Heart,
};

export default function DuasPage() {
  return (
    <div className="page">
      <PageHead title="Duas & Adhkar" sub="Remembrance and supplication from the Quran and Sunnah, with sources." />
      <ul className="cat-grid list-plain">
        {DUA_CATEGORIES.map((c) => {
          const Icon = CATEGORY_ICONS[c.id] ?? HandHeart;
          return (
            <li key={c.id}>
              <Link to={`/duas/${c.id}`} className="cat-card">
                <span className="tile-icon">
                  <Icon aria-hidden="true" />
                </span>
                <span className="cat-card__text">
                  <span className="cat-card__title">{c.title}</span>
                  <span className="cat-card__blurb">{c.blurb}</span>
                </span>
                <span className="cat-card__count" aria-label={`${c.items.length} items`}>
                  {c.items.length}
                </span>
                <ChevronRight className="chev" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
