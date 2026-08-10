# No Emojis — Never

Under absolutely no circumstances may you use emoji characters in any code, UI, text, comments, commit messages, or any other output.

## Replacements

Instead of emojis, use:

| Instead of | Use |
|---|---|
| Any emoji icon | Lucide React icons (`lucide-react`) |
| Emoji in text | Plain text, no substitution needed |
| Emoji bullets | Standard list markers or Lucide `Dot` |
| Flag emojis | Country code text or nothing |
| Emoji in commit messages | Plain ASCII |

## Lucide Quick Reference

```tsx
import { Film, Tv, Swords, Globe, Search, Home, Menu, X, Play,
         History, Clock, Sparkles, Library, ExternalLink,
         ChevronDown, ChevronUp, LoaderCircle, AlertTriangle,
         ShieldAlert, BookOpen, Heart } from "lucide-react";
```

## Violation Check

Before committing any output, scan for Unicode emoji ranges. If any match is found, replace immediately.
