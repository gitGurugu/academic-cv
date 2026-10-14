---
# Leave the homepage title empty to use the site title
title: ''
summary: ''
date: 2022-10-24
type: landing

sections:
  - block: resume-biography-3
    content:
      # Choose a user profile to display (a folder name within `content/authors/`)
      username: me
      text: ''
      # Show a call-to-action button under your biography? (optional)
      button:
        text: Download CV
        url: uploads/resume.pdf
      # GitHub username for the activity graph (needs a profile repo with the snake workflow)
      github_user: gitGurugu
      headings:
        about: 'Biography'
        education: ''
        interests: ''
    design:
      # Use the new Gradient Mesh which automatically adapts to the selected theme colors
      background:
        gradient_mesh:
          enable: true

      # Name heading sizing to accommodate long or short names
      name:
        size: sm # Options: xs, sm, md, lg (default), xl

      # Avatar customization
      avatar:
        size: small # Options: small (150px), medium (200px, default), large (320px), xl (400px), xxl (500px)
        shape: rounded # Options: circle (default), square, rounded
  # Every folder in content/publications/ is listed here, newest first. To add a paper,
  # copy a folder there and edit its index.md; a cite.bib in the folder adds a "Cite" button.
  - block: collection
    id: publications
    content:
      title: Recent Publications
      text: ''
      filters:
        folders:
          - publications
        exclude_featured: false
    design:
      view: citation
      # Standalone page: divider lines above and below, at least one screen tall, grows with content
      css_class: page-section
  # News: one entry per year under `milestones`, newest first; items support **bold** and links.
  # Add a `setbacks:` map (title, intro, link, link_text, items: [{year, entries: [{name, status}]}])
  # to show the "Setbacks & Lessons" card beside it; without it Milestones spans the full width.
  - block: news-board
    id: news
    content:
      title: News
      text: ''
      milestones:
        - year: 2026
          items:
            - Admitted through the recommendation (exam-exempt) program to the **Ph.D. program at SIA, UCAS**.
            - Our work **CPGR-Mem** was accepted by IEEE IJCNN.
    design:
      spacing:
        padding: [0, 0, 0, 0]
---
