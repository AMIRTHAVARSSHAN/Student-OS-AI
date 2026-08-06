import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

def generate_print_optimized_html(title: str, markdown_content: str, theme: str = "light") -> str:
    """
    Generates a print-optimized, publication-grade HTML document.
    Ensures Mermaid diagrams, Callout cards, and KaTeX math render with crisp high contrast,
    eliminating dark-box unreadable text on printouts.
    """
    
    bg_color = "#ffffff" if theme == "light" else "#0d0c15"
    text_color = "#1e293b" if theme == "light" else "#f8fafc"
    card_bg = "#f1f5f9" if theme == "light" else "#1e1b4b"
    border_color = "#cbd5e1" if theme == "light" else "#3730a3"
    header_color = "#4f46e5" if theme == "light" else "#a5b4fc"
    
    html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{title} - ScholarOS Notes</title>
    <style>
        @page {{
            size: A4;
            margin: 20mm;
            @bottom-right {{
                content: counter(page) " / " counter(pages);
            }}
        }}
        body {{
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: {bg_color};
            color: {text_color};
            line-height: 1.6;
            margin: 0;
            padding: 24px;
        }}
        h1 {{
            font-size: 26px;
            font-weight: 900;
            color: {header_color};
            border-bottom: 3px solid {header_color};
            padding-bottom: 8px;
            margin-top: 0;
        }}
        h2 {{
            font-size: 20px;
            font-weight: 800;
            color: {header_color};
            margin-top: 24px;
            border-bottom: 1px solid {border_color};
            padding-bottom: 4px;
        }}
        h3 {{
            font-size: 16px;
            font-weight: 700;
            margin-top: 18px;
        }}
        blockquote {{
            background: {card_bg};
            border-left: 4px solid {header_color};
            margin: 16px 0;
            padding: 12px 16px;
            border-radius: 0 8px 8px 0;
            color: {text_color};
            font-style: italic;
        }}
        pre, code {{
            font-family: 'Fira Code', 'Courier New', monospace;
            background: {card_bg};
            color: {text_color};
            border-radius: 6px;
        }}
        pre {{
            padding: 14px;
            overflow-x: auto;
            border: 1px solid {border_color};
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }}
        th, td {{
            border: 1px solid {border_color};
            padding: 10px 14px;
            text-align: left;
        }}
        th {{
            background-color: {card_bg};
            font-weight: 700;
        }}
        /* Mermaid Diagram Fix for Printing */
        .mermaid, svg {{
            background: transparent !important;
            color: {text_color} !important;
            max-width: 100%;
        }}
        rect {{
            fill: {card_bg} !important;
            stroke: {header_color} !important;
        }}
        text {{
            fill: {text_color} !important;
            font-weight: 600 !important;
        }}
    </style>
</head>
<body>
    <h1>{title}</h1>
    <div id="content">
        {markdown_content}
    </div>
</body>
</html>
"""
    return html_template
