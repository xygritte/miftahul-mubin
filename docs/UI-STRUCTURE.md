# Miftahul Mubin — UI Structure

## Visual Direction

Target: editorial news portal inspired by the information hierarchy of NU Online, without copying its branding or visual identity.

### Principles

- Clean white/off-white content canvas
- Masjid green as identity color; optional gold accent
- Strong editorial headlines
- Large photography for lead stories
- Dense but readable news lists
- Clear section separators
- Minimal decorative Islamic ornament
- Mobile-first responsive layout

## Global Layout

```text
Top utility bar
        |
Main header: logo + primary navigation + search
        |
Category navigation
        |
Page content
        |
Footer
```

## Home Layout

```text
[UTILITY BAR]

[LOGO] [Beranda] [Berita] [Keislaman] [Kegiatan] [Keuangan] [Search]

[SUB NAV: Pengumuman | Khutbah | Dokumentasi | Kepengurusan]

[FEATURED GRID]
[Large lead story] [Small story]
                  [Small story]

[TERPOPULER]
01 ...  02 ...  03 ...  04 ...  05 ...

[BERITA TERKINI]
[card] [card] [card]
[card] [card] [card]

[AGENDA TERDEKAT]
[agenda list] [agenda list] [agenda list]

[KEISLAMAN]
[featured] [article] [article]

[VIDEO / DOKUMENTASI]
[video] [video] [album]

[KEGIATAN SOSIAL]
[card] [card] [card]

[TRANSPARANSI KEUANGAN]
[pemasukan] [pengeluaran] [saldo]
[link laporan]

[FOOTER]
```

## Content Components

```text
components/
├── layout/
│   ├── Header
│   ├── Footer
│   ├── MobileNav
│   └── SearchOverlay
├── editorial/
│   ├── FeaturedStory
│   ├── NewsCard
│   ├── NewsList
│   ├── PopularList
│   ├── SectionHeader
│   └── RelatedContent
├── events/
│   ├── EventCard
│   ├── EventList
│   └── EventStatus
├── finance/
│   ├── FinanceSummary
│   ├── TransactionTable
│   └── FinanceChart
├── media/
│   ├── GalleryGrid
│   ├── AlbumCard
│   └── VideoCard
└── shared/
    ├── Pagination
    ├── EmptyState
    ├── LoadingState
    └── ErrorState
```

## Accessibility

- Semantic heading hierarchy
- Keyboard navigable controls
- Visible focus state
- Alt text for editorial images
- Sufficient text/background contrast
- Form labels for admin forms
- Mobile touch targets with adequate size

## Responsive Behavior

### Mobile

- Hamburger menu
- One-column article feed
- Horizontal category scroller where necessary
- Finance cards stacked
- Tables become horizontally scrollable or card-based

### Tablet

- Two-column content sections
- Compact sidebar where useful

### Desktop

- Centered max-width content container
- Multi-column editorial grids
- Optional right rail for Terpopuler / sidebar modules
