class StyleService {
  /**
   * Obter estilo padrão
   */
  static getDefaultStyle() {
    return {
      fontFamily: 'Arial',
      fontSize: 48,
      textColor: '#FFFFFF',
      outlineColor: '#000000',
      outlineWidth: 2,
      bold: false,
      italic: false,
      underline: false,
      alignment: 'center',
      shadowEnabled: true,
      shadowColor: '#000000',
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      shadowBlur: 4
    };
  }

  /**
   * Validar dados de estilo
   */
  static validateStyle(style) {
    const errors = [];

    // Validar fonte
    if (style.fontFamily) {
      const validFonts = this.getAvailableFonts().map(f => f.value);
      if (!validFonts.includes(style.fontFamily)) {
        errors.push('Fonte inválida');
      }
    }

    // Validar tamanho da fonte
    if (style.fontSize !== undefined) {
      if (typeof style.fontSize !== 'number' || style.fontSize < 12 || style.fontSize > 200) {
        errors.push('Tamanho da fonte deve estar entre 12 e 200');
      }
    }

    // Validar cores
    if (style.textColor && !this.isValidColor(style.textColor)) {
      errors.push('Cor do texto inválida');
    }

    if (style.outlineColor && !this.isValidColor(style.outlineColor)) {
      errors.push('Cor do contorno inválida');
    }

    // Validar alinhamento
    if (style.alignment && !['left', 'center', 'right'].includes(style.alignment)) {
      errors.push('Alinhamento deve ser left, center ou right');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar cor hexadecimal
   */
  static isValidColor(color) {
    return /^#[0-9A-F]{6}$/i.test(color);
  }

  /**
   * Obter fontes disponíveis
   */
  static getAvailableFonts() {
    return [
      { name: 'Arial', value: 'Arial' },
      { name: 'Verdana', value: 'Verdana' },
      { name: 'Helvetica', value: 'Helvetica' },
      { name: 'Times New Roman', value: 'Times New Roman' },
      { name: 'Georgia', value: 'Georgia' },
      { name: 'Courier New', value: 'Courier New' },
      { name: 'Comic Sans MS', value: 'Comic Sans MS' },
      { name: 'Impact', value: 'Impact' },
      { name: 'Trebuchet MS', value: 'Trebuchet MS' },
      { name: 'Montserrat', value: 'Montserrat' },
      { name: 'Roboto', value: 'Roboto' },
      { name: 'Open Sans', value: 'Open Sans' },
      { name: 'Lato', value: 'Lato' },
      { name: 'Oswald', value: 'Oswald' },
      { name: 'Raleway', value: 'Raleway' }
    ];
  }

  /**
   * Gerar propriedades CSS baseadas no estilo
   */
  static generateCSSProperties(style) {
    const css = {};

    if (style.fontFamily) {
      css.fontFamily = `"${style.fontFamily}", sans-serif`;
    }

    if (style.fontSize) {
      css.fontSize = `${style.fontSize}px`;
    }

    if (style.textColor) {
      css.color = style.textColor;
    }

    if (style.bold) {
      css.fontWeight = 'bold';
    }

    if (style.italic) {
      css.fontStyle = 'italic';
    }

    if (style.underline) {
      css.textDecoration = 'underline';
    }

    if (style.alignment) {
      css.textAlign = style.alignment;
    }

    // Text stroke (contorno)
    if (style.outlineColor && style.outlineWidth) {
      css.webkitTextStroke = `${style.outlineWidth}px ${style.outlineColor}`;
      css.textStroke = `${style.outlineWidth}px ${style.outlineColor}`;
    }

    // Text shadow
    if (style.shadowEnabled && style.shadowColor) {
      const x = style.shadowOffsetX || 2;
      const y = style.shadowOffsetY || 2;
      const blur = style.shadowBlur || 4;
      css.textShadow = `${x}px ${y}px ${blur}px ${style.shadowColor}`;
    }

    return css;
  }

  /**
   * Gerar filtro FFmpeg para legendas
   */
  static generateFFmpegFilter(style, text, startTime, endTime) {
    const fontSize = style.fontSize || 48;
    const fontColor = this.hexToFFmpegColor(style.textColor || '#FFFFFF');
    const outlineColor = this.hexToFFmpegColor(style.outlineColor || '#000000');
    const outlineWidth = style.outlineWidth || 2;
    
    // Escapar texto para FFmpeg
    const escapedText = this.escapeFFmpegText(text);
    
    // Posição baseada no alinhamento
    let x = '(w-text_w)/2'; // center (padrão)
    if (style.alignment === 'left') {
      x = '50';
    } else if (style.alignment === 'right') {
      x = '(w-text_w-50)';
    }
    
    const y = '(h-text_h-100)'; // Próximo ao bottom
    
    // Estilo de fonte
    let fontStyle = style.fontFamily || 'Arial';
    if (style.bold && style.italic) {
      fontStyle += '-BoldItalic';
    } else if (style.bold) {
      fontStyle += '-Bold';
    } else if (style.italic) {
      fontStyle += '-Italic';
    }

    // Construir filtro drawtext
    let filter = `drawtext=`;
    filter += `text='${escapedText}':`;
    filter += `fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:`;
    filter += `fontsize=${fontSize}:`;
    filter += `fontcolor=${fontColor}:`;
    filter += `borderw=${outlineWidth}:`;
    filter += `bordercolor=${outlineColor}:`;
    filter += `x=${x}:`;
    filter += `y=${y}:`;
    filter += `enable='between(t,${startTime},${endTime})'`;

    // Adicionar sombra se habilitada
    if (style.shadowEnabled) {
      const shadowX = style.shadowOffsetX || 2;
      const shadowY = style.shadowOffsetY || 2;
      filter += `:shadowx=${shadowX}:shadowy=${shadowY}`;
      
      if (style.shadowColor) {
        filter += `:shadowcolor=${this.hexToFFmpegColor(style.shadowColor)}`;
      }
    }

    return filter;
  }

  /**
   * Converter cor hex para formato FFmpeg
   */
  static hexToFFmpegColor(hex) {
    // Remove # se existir
    hex = hex.replace('#', '');
    
    // Converter para formato 0xRRGGBB
    return `0x${hex}`;
  }

  /**
   * Escapar texto para FFmpeg
   */
  static escapeFFmpegText(text) {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/:/g, '\\:')
      .replace(/\n/g, '\\n')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]');
  }

  /**
   * Gerar string de estilo para subtitle (ASS format)
   */
  static generateASSStyle(style) {
    const fontName = style.fontFamily || 'Arial';
    const fontSize = style.fontSize || 48;
    const primaryColor = this.hexToASSColor(style.textColor || '#FFFFFF');
    const outlineColor = this.hexToASSColor(style.outlineColor || '#000000');
    const outlineWidth = style.outlineWidth || 2;
    
    let bold = style.bold ? -1 : 0;
    let italic = style.italic ? -1 : 0;
    let underline = style.underline ? -1 : 0;
    
    let alignment = 2; // Center bottom (padrão)
    if (style.alignment === 'left') {
      alignment = 1; // Left bottom
    } else if (style.alignment === 'right') {
      alignment = 3; // Right bottom
    }

    return `Style: Default,${fontName},${fontSize},${primaryColor},&H000000FF,${outlineColor},&H00000000,${bold},${italic},${underline},0,100,100,0,0,${outlineWidth},2,10,10,10,10,1`;
  }

  /**
   * Converter hex para cor ASS (formato &HAABBGGRR)
   */
  static hexToASSColor(hex) {
    hex = hex.replace('#', '');
    const r = hex.substr(0, 2);
    const g = hex.substr(2, 2);
    const b = hex.substr(4, 2);
    return `&H00${b}${g}${r}`;
  }

  /**
   * Converter estilo para objeto CSS inline
   */
  static toCSSString(style) {
    const css = this.generateCSSProperties(style);
    return Object.entries(css)
      .map(([key, value]) => {
        // Converter camelCase para kebab-case
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value}`;
      })
      .join('; ');
  }

  /**
   * Mesclar estilos
   */
  static mergeStyles(baseStyle, overrideStyle) {
    return {
      ...this.getDefaultStyle(),
      ...baseStyle,
      ...overrideStyle
    };
  }

  /**
   * Clonar estilo
   */
  static cloneStyle(style) {
    return JSON.parse(JSON.stringify(style));
  }

  /**
   * Comparar dois estilos
   */
  static areStylesEqual(style1, style2) {
    return JSON.stringify(style1) === JSON.stringify(style2);
  }

  /**
   * Obter preset de estilos
   */
  static getStylePresets() {
    return {
      classic: {
        name: 'Clássico',
        style: {
          ...this.getDefaultStyle(),
          fontFamily: 'Arial',
          fontSize: 48,
          textColor: '#FFFFFF',
          outlineColor: '#000000',
          outlineWidth: 3,
          bold: true
        }
      },
      modern: {
        name: 'Moderno',
        style: {
          ...this.getDefaultStyle(),
          fontFamily: 'Montserrat',
          fontSize: 52,
          textColor: '#FFFFFF',
          outlineColor: '#0066FF',
          outlineWidth: 2,
          bold: false
        }
      },
      elegant: {
        name: 'Elegante',
        style: {
          ...this.getDefaultStyle(),
          fontFamily: 'Georgia',
          fontSize: 44,
          textColor: '#FFD700',
          outlineColor: '#000000',
          outlineWidth: 2,
          italic: true
        }
      },
      bold: {
        name: 'Negrito',
        style: {
          ...this.getDefaultStyle(),
          fontFamily: 'Impact',
          fontSize: 56,
          textColor: '#FF0000',
          outlineColor: '#FFFFFF',
          outlineWidth: 4,
          bold: true
        }
      },
      minimal: {
        name: 'Minimalista',
        style: {
          ...this.getDefaultStyle(),
          fontFamily: 'Roboto',
          fontSize: 40,
          textColor: '#FFFFFF',
          outlineColor: '#000000',
          outlineWidth: 1,
          shadowEnabled: false
        }
      }
    };
  }
}

export default StyleService;
