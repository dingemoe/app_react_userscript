(() => {
  const dialToggleCss = ({ position, size, open }) => `
    :host{ z-index:2147483647; font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial }

    @keyframes dtPopIn{
      0%{opacity:0; transform:translateY(10px) scale(.985); filter:blur(10px)}
      100%{opacity:1; transform:translateY(0) scale(1); filter:blur(0)}
    }
    @keyframes dtPopOut{
      0%{opacity:1; transform:translateY(0) scale(1); filter:blur(0)}
      100%{opacity:0; transform:translateY(10px) scale(.985); filter:blur(10px)}
    }

    .dial{
      position:fixed; right:${position.right}px; bottom:${position.bottom}px;
      width:${size.btn}px; height:${size.btn}px; border-radius:999px;
      border:1px solid rgba(255, 255, 255, 0.1);
      background:rgba(8, 8, 10, 0.78);
      color:#ffffff;
      display:grid; place-items:center;
      cursor:pointer;
      box-shadow:0 12px 30px rgba(0,0,0,0.3);
      backdrop-filter: blur(14px) saturate(160%);
      -webkit-backdrop-filter: blur(14px) saturate(160%);
      transition: transform 0.2s, background 0.2s;
    }
    .dial:hover{ background:rgba(18, 18, 21, 0.88); transform:scale(1.05); }
    .dial:active{ transform:scale(0.95); }
    .dial.pulse{
      filter: brightness(1.10);
      box-shadow:0 14px 40px rgba(0,0,0,0.45);
    }

    .panel{
      position:fixed;
      right:${position.right}px;
      bottom:${position.bottom + size.btn + 10}px;
      width:${size.panelW}px; height:${size.panelH}px;
      border-radius:24px;
      border:1px solid rgba(255, 255, 255, 0.1);
      background:
        linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 22%, rgba(255,255,255,0) 60%),
        radial-gradient(circle at 75% 15%, rgba(59, 130, 246, 0.18) 0%, transparent 65%),
        radial-gradient(circle at 25% 85%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
        rgba(13, 13, 17, 0.86);
      color:#ffffff;
      box-shadow:
        0 40px 100px rgba(0, 0, 0, 0.55),
        inset 0 1px 0 rgba(255,255,255,0.10),
        inset 0 0 24px rgba(59, 130, 246, 0.05);
      overflow:hidden;
      backdrop-filter: blur(34px) saturate(165%);
      -webkit-backdrop-filter: blur(34px) saturate(165%);
      transform-origin: 85% 100%;
      animation: dtPopIn .22s ease forwards;
    }

    /* På lyse sider: mindre gjennomsiktig (bedre lesbarhet) */
    :host([data-page="light"]) .dial{ background:rgba(8, 8, 10, 0.92); }
    :host([data-page="light"]) .dial:hover{ background:rgba(18, 18, 21, 0.96); }
    :host([data-page="light"]) .panel{
      background:
        linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 22%, rgba(255,255,255,0) 60%),
        radial-gradient(circle at 75% 15%, rgba(59, 130, 246, 0.14) 0%, transparent 65%),
        radial-gradient(circle at 25% 85%, rgba(59, 130, 246, 0.06) 0%, transparent 50%),
        rgba(13, 13, 17, 0.94);
    }
    .panel.closed{
      pointer-events:none;
      animation: dtPopOut .20s ease forwards;
    }

    .icon-open{ display:${open ? 'inline' : 'none'}; }
    .icon-close{ display:${open ? 'none' : 'inline'}; }
  `.trim();

  UI.Config({
    css: {
      dialToggle: dialToggleCss
    },
    // kun global CSS for elementer som ikke bruker UI.Style (scopet til vår root)
    cssText: `
      #tm_root{
        --tm-text: rgba(255,255,255,0.92);
        --tm-text-muted: rgba(255,255,255,0.72);
        --tm-surface-alpha: 0.60;
        --tm-card-alpha: 0.025;
        --tm-card-border: 0.045;
        --tm-reflect-1: 0.05;
        --tm-reflect-2: 0.02;
      }
      #tm_root[data-page="light"]{
        --tm-text: rgba(255,255,255,0.96);
        --tm-text-muted: rgba(255,255,255,0.85);
        --tm-surface-alpha: 0.92;
        --tm-card-alpha: 0.06;
        --tm-card-border: 0.08;
        --tm-reflect-1: 0.04;
        --tm-reflect-2: 0.016;
      }

      #tm_root .tm_tabs_box{
        padding: 6px;
        background: rgba(255,255,255,var(--tm-card-alpha));
        color: var(--tm-text);
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,var(--tm-card-border));
        font-size: 12px;
        line-height: 1.35;
        text-shadow: 0 1px 1px rgba(0,0,0,0.35);
      }
    `.trim(),
    classes:{
      app_wrap:{position:'relative',width:'100%',height:'100%',zIndex:'1'},
      app_card:{
        width:'100%',
        height:'100%',
        display:'flex',
        flexDirection:'column',
        background:[
          'linear-gradient(135deg, rgba(255,255,255,var(--tm-reflect-1)) 0%, rgba(255,255,255,var(--tm-reflect-2)) 22%, rgba(255,255,255,0) 60%)',
          'radial-gradient(circle at 75% 15%, rgba(59, 130, 246, 0.14) 0%, transparent 65%)',
          'radial-gradient(circle at 25% 85%, rgba(59, 130, 246, 0.06) 0%, transparent 50%)',
          'rgba(13, 13, 17, var(--tm-surface-alpha))'
        ].join(', '),
        color:'var(--tm-text)',
        textShadow:'0 1px 1px rgba(0,0,0,0.35)',
        fontSize:'12px',
        lineHeight:'1.35',
        padding:'6px',
        borderRadius:'20px',
        border:'1px solid rgba(255, 255, 255, 0.1)',
        boxShadow:'0 40px 100px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 18px rgba(59, 130, 246, 0.04)'
      },
      layout:{display:'flex',flexDirection:'column',gap:'6px',height:'100%'},
      split:{display:'flex',gap:'6px',height:'100%'},
      card:{
        background:'rgba(255,255,255,var(--tm-card-alpha))',
        borderRadius:'14px',
        padding:'6px',
        border:'1px solid rgba(255,255,255,var(--tm-card-border))',
        boxShadow:'inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 60px rgba(0,0,0,0.22)',
        flex:'1'
      },
      menu:{display:'flex',gap:'6px',flexWrap:'wrap'},
      menu_item:{
        fontSize:'11px',
        padding:'3px 6px',
        border:'1px solid rgba(255,255,255,0.10)',
        borderRadius:'9px',
        cursor:'pointer',
        background:'rgba(255,255,255,var(--tm-card-alpha))',
        color:'var(--tm-text-muted)',
        textDecoration:'none',
        display:'inline-block',
        userSelect:'none'
      },
      menu_item_active:{
        background:'#1a4db4',
        border:'1px solid rgba(96, 165, 250, 0.3)',
        color:'#ffffff',
        boxShadow:'0 8px 24px rgba(32, 100, 210, 0.5)'
      }
    }
  });
})();
