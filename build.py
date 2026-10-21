dark = {
 '--bg':'#0a0b0a','--card':'rgba(22,25,23,.8)','--card-solid':'#151816','--label':'#eeeae0','--label2':'rgba(238,234,224,.6)','--label3':'rgba(238,234,224,.3)',
 '--sep':'rgba(238,234,224,.12)','--fill':'rgba(238,234,224,.08)','--fill2':'rgba(238,234,224,.16)','--accent':'#6dbf9e','--on-accent':'#05201a','--muscle':'#6dbf9e','--dev':'#f1ece0','--lung':'#ff5a6e','--mind':'#64c8f0','--danger':'#ff6b5e',
 '--m0':'#2b302c','--fig':'#191c1a','--fig-line':'#0b0d0c','--glass':'rgba(24,28,26,.6)','--glass-brd':'rgba(238,234,224,.10)','--glass-hi':'rgba(238,234,224,.07)',
 '--shadow':'0 10px 30px rgba(0,0,0,.5)','--blob1':'rgba(109,191,158,.10)','--blob2':'rgba(241,236,224,.05)','--scene':'#0d100e','--floor':'#181c19'}
decl = ' '.join(f'{k}: {v};' for k,v in dark.items()) + ' color-scheme: dark;'
css = open('src/app.css').read().replace('/*DARK*/',
  '@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]):not(.ap-light) { ' + decl + ' } }\n'
  ':root[data-theme="dark"]:not(.ap-light), :root.ap-dark { ' + decl + ' }\n'
  ':root.ap-light { color-scheme: light; }\n')
css += '\n#sheet { background: color-mix(in srgb, var(--bg) 84%, transparent); }\n' + open('src/form3d.css').read()
nav_body = '<svg viewBox="0 0 24 24"><circle cx="12" cy="4.6" r="2.3"/><path d="M5.5 9h13M12 9v5.5M12 14.5l-3 7M12 14.5l3 7"/></svg>'
nav_mind = '<svg viewBox="0 0 24 24"><path d="M9 20v-3.5C6.5 15.7 5 13.4 5 10.5 5 6.4 8.1 3.5 12 3.5s7 2.9 7 6.6c0 .9.6 1.6 1.4 2.6l-1.4.6v2.7c0 .9-.7 1.6-1.6 1.6H15V20"/><path d="M10 9.5c.6-1 2.3-1.3 3 0M11 12.5h2"/></svg>'
nav_prog = '<svg viewBox="0 0 24 24"><path d="M4 19V5M4 19h16M8 15l4-4 3 3 5-6"/></svg>'
html = f'''<title>Sculptor</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&display=swap">
<style>
{css}
</style>
<div class="app"><main id="main"></main></div>
<div id="backdrop" hidden></div>
<div id="sheet" class="glass" role="dialog" aria-modal="true" aria-label="Details" hidden></div>
<div id="toast" class="glass" role="status" hidden></div>
<nav id="nav" class="glass" aria-label="Sections"><button data-tab="body">{nav_body}Body</button><button data-tab="mind">{nav_mind}Mind</button><button data-tab="progress">{nav_prog}Progress</button></nav>
<script>
{open('src/form3d.js').read()}
</script>
<script>
{open('src/core.js').read()}
{open('src/ui.js').read().replace('Theme.apply();\nrenderMain();\nStore.init();', '')}
{open('src/mind.js').read()}
Theme.apply();
renderMain();
Store.init();
</script>
'''
page = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<meta name="theme-color" content="#0a0b0a">\n<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}</style>\n</head>\n<body>\n' + html + '</body>\n</html>\n'
open('index.html', 'w').write(page)
print('built index.html', len(page))
