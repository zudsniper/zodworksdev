---
title: "Advanced Liquid Features Demo"
description: "A comprehensive showcase of custom Liquid filters and tags for portfolio and blog enhancement"
excerpt: "Explore the power of custom Liquid filters and tags with practical examples including project cards, alerts, timelines, and advanced text processing."
tags: ["liquid", "templating", "portfolio", "demo", "advanced"]
author: "jason mcelhenney"
publishDate: "2024-01-25T15:30:00Z"
status: "published"
template: "post"
theme: "default"
slug: "advanced-liquid-features-demo"
metadata:
  readingTime: "10 min"
  difficulty: "intermediate"
  series: "liquid-mastery"
---

# Advanced Liquid Features Demo

Welcome to a comprehensive showcase of custom Liquid filters and tags! This post demonstrates the enhanced templating capabilities available in our blog system.

## Date Formatting Filters

Let's explore various date formatting options:

- **Standard long format**: {{ frontmatter.publishDate | date_format: "long" }}
- **Short format**: {{ frontmatter.publishDate | date_format: "short" }}
- **Year only**: {{ frontmatter.publishDate | date_format: "year" }}
- **Relative time**: {{ frontmatter.publishDate | date_format: "relative" }}
- **ISO format**: {{ frontmatter.publishDate | date_format: "iso" }}

## Text Processing Filters

### Text Transformation
- **Original text**: "hello world from liquid templates"
- **Capitalized**: {{ "hello world from liquid templates" | capitalize_first }}
- **Title case**: {{ "hello world from liquid templates" | title_case }}
- **Slug format**: {{ "hello world from liquid templates" | slug }}

### Content Analysis
This post contains **{{ frontmatter.description | word_count }} words** in the description.

The excerpt limited to 20 words: {{ frontmatter.excerpt | limit_words: 20 }}

## URL and Link Filters

- **Absolute URL**: {{ "/blog/sample-post" | absolute_url }}
- **External link check**: {{ "https://example.com" | external_link }}
- **Shield badge**: ![Demo Badge]({{ "Demo-Badge" | shield_badge: "green" }})

## Portfolio-Specific Features

### Project Status Colors
- Live project: {{ "live" | project_status_color }}
- Ongoing project: {{ "ongoing" | project_status_color }}  
- Archived project: {{ "archived" | project_status_color }}

### GitHub Language Colors
- TypeScript: #{{ "typescript" | github_lang_color }}
- Python: #{{ "python" | github_lang_color }}
- Rust: #{{ "rust" | github_lang_color }}

## Custom Tags in Action

### Alert Messages

{% alert info %}
This is an informational alert demonstrating the custom alert tag functionality.
{% endalert %}

{% alert warning %}
Warning alerts help highlight important information that users should pay attention to.
{% endalert %}

{% alert success %}
Success alerts are perfect for confirming that operations completed successfully.
{% endalert %}

{% alert tip %}
Pro tip: Custom tags make content more engaging and visually appealing!
{% endalert %}

### Enhanced Code Blocks

{% code_block javascript main.js %}
function greetWorld() {
  console.log("Hello from a custom code block!");
  return "Custom Liquid tags are awesome!";
}

greetWorld();
{% endcode_block %}

{% code_block python utils.py %}
def calculate_reading_time(content):
    """Calculate estimated reading time for content."""
    words = len(content.split())
    minutes = max(1, words // 200)
    return f"{minutes} min read"

print(calculate_reading_time("Sample content here"))
{% endcode_block %}

### Timeline Example

{% timeline %}
{% timeline_item 2024-01 "Enhanced Liquid Integration" %}
Implemented comprehensive custom filters and tags for better content authoring experience.
{% endtimeline_item %}

{% timeline_item 2024-01 "Template Structure Overhaul" %}
Created modular template system with reusable partials and improved inheritance.
{% endtimeline_item %}

{% timeline_item 2024-01 "Content Pipeline Development" %}
Built file-based content parsing system supporting Markdown + frontmatter with Liquid compilation.
{% endtimeline_item %}
{% endtimeline %}

## Advanced Content Processing

### Markdown Filter

Here's some **markdown content** that gets processed by our custom filter:

{{ "## This is markdown\n\n- Item 1\n- Item 2\n- **Bold item**\n\n[Link example](https://example.com)" | markdown }}

### Collection Operations

{% if posts %}
**Blog post analysis:**
- Total posts: {{ posts.size }}
- Unique tags: {{ posts | unique_tags | size }}
- Recent posts: {{ posts | sort_by_date: "desc" | limit: 3 | map: "title" | join: ", " }}
{% endif %}

## Social Links

{% social_links horizontal %}

## Conclusion

These custom Liquid filters and tags provide powerful capabilities for creating rich, dynamic content while maintaining the simplicity of Markdown authoring. The system now supports:

- **Enhanced date formatting** with multiple format options
- **Advanced text processing** including case transformations and content analysis  
- **Portfolio-specific utilities** for project showcases and technical content
- **Rich content elements** like alerts, timelines, and enhanced code blocks
- **URL and link processing** for better link management
- **Collection operations** for working with arrays of content

This demonstrates the flexibility and power of combining Liquid templating with modern web development practices!

---

**Note**: This post showcases the enhanced templating system. All filters and tags are functional and ready for use in your content creation workflow. 