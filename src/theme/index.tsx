//import { transparentize } from 'polished'
//import React, { useMemo } from 'react
import React from "react";
import styled, {
  ThemeProvider as StyledComponentsThemeProvider,
  createGlobalStyle,
  css,
  DefaultTheme
} from "styled-components";
import { useIsDarkMode } from "../state/user/hooks";
import { Text, TextProps } from "rebass";
import { Colors } from "./styled";

export * from "./components";
// import BgImg from '../assets/images/pc.png'

const MEDIA_WIDTHS = {
  upToMoreExtraSmall: 430,
  upToExtraSmall: 576,
  upToSmall: 768,
  upToMedium: 1020,
  upToLarge: 1530
};

const mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(MEDIA_WIDTHS).reduce(
  (accumulator, size) => {
    (accumulator as any)[size] = (a: any, b: any, c: any) => css`
      @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
        ${css(a, b, c)}
      }
    `;
    return accumulator;
  },
  {}
) as any;

export function lightColors(): Colors {
  return {
    // base
    white: "#FFFFFF",
    black: "#000000",

    // gray
    grayDark: "#4F4C69",
    grayTxt: "#777777",
    grayTxt2: "#777777",
    gray1: "#E0E0E0",
    grayLight: "#FEFEFF",

    // color
    purple1: "#4D1E88",
    purple2: "#8637D5",
    purple3: "#8E76AB",
    purpleBoxline1: "#DABFF9",
    purpleBoxline2: "#EEE4F9",
    purpleBtline: "#DACFE6",
    purpleDisabled: "#C5BAD0",
    purpleDisabledColor: "#F0E9F8",
    purpleTxt: "#F0E9F8",
    purpleLine: "#8545EE",
    purpleBg: "#F9F5FD",
    pinkPoint1: "#DF1955",
    pinkPoint2: "#DA2058",

    // gradient
    gradientPurple: "linear-gradient(303.37deg, #8946F7 5.33%, #C25FFF 91.77%);",
    gradientgray: "linear-gradient(180deg, #F7F6F9 38.02%, #DFDFDF 94.79%)",
    gradientBg: "linear-gradient(180deg, #F7F6F9 38.02%, #DFDFDF 94.79%)",

    // text
    text1: "#FFFFFF",
    text2: "#777",
    text3: "#6C7284",
    text4: "#565A69",
    text5: "#2C2F36",

    // backgrounds / greys
    bg1: "#212429",
    bg2: "#2C2F36",
    bg3: "#40444F",
    bg4: "#565A69",
    bg5: "#6C7284",

    //specialty colors
    modalBG: "rgba(0,0,0,.35)",
    advancedBG: "rgba(0,0,0,0.1)",

    //primary colors
    primary1: "#4D1E88",
    primary2: "#8637D5",
    primary3: "#8E76AB",
    primary4: "#8637D5",
    primary5: "#4D1E88",

    // color text
    primaryText1: "#6da8ff",

    // secondary colors
    secondary1: "#2172E5",
    secondary2: "#17000b26",
    secondary3: "#17000b26",

    // other
    red1: "#F64F81",
    red2: "#F82D3A",
    green1: "#27AE60",
    yellow1: "#FFE270",
    yellow2: "#F3841E",
    blue1: "#04C1DB",

    //backgroundColor
    bgColor1: "#F7F6F9",
    bgColor2: "#DFDFDF",
    bodyWrapper: "#fff",
    bodyWrapperLine: "#EEE4F9"
  };
}

export function darkColors(): Colors {
  return {
    // base
    white: "#0C0B1B",
    black: "#FFF",

    // gray
    grayDark: "#BBB3DC",
    grayTxt: "#83839E",
    grayTxt2: "#8C81CF",
    gray1: "#2E2D4A",
    grayLight: "#0C0B1B",

    // color
    purple1: "#FFF",
    purple2: "#8637D5",
    purple3: "#8C81CF",
    purpleBoxline1: "#0C0B1B",
    purpleBoxline2: "#0C0B1B",
    purpleBtline: "#0D0C15",
    purpleDisabled: "#4A4868",
    purpleDisabledColor: "#9593c1",
    purpleTxt: "#3A3854",
    purpleLine: "#8545EE",
    purpleBg: "#272737",
    pinkPoint1: "#DF1955",
    pinkPoint2: "#F74F81",

    // gradient
    gradientPurple: "linear-gradient(303.37deg, #8946F7 5.33%, #C25FFF 91.77%);",
    gradientgray: "linear-gradient(180deg, #F7F6F9 38.02%, #DFDFDF 94.79%)",
    gradientBg: "linear-gradient(180deg, #2F2E3A 38.02%, #1C1C2A 94.79%)",

    // text
    text1: "#777",
    text2: "#83839E",
    text3: "#6C7284",
    text4: "#fff",
    text5: "#EDECF1",

    // backgrounds / greys
    bg1: "#212429",
    bg2: "#2C2F36",
    bg3: "#40444F",
    bg4: "#565A69",
    bg5: "#6C7284",

    //specialty colors
    modalBG: "rgba(0,0,0,.35)",
    advancedBG: "rgba(0,0,0,0.1)",

    //primary colors
    primary1: "#4D1E88",
    primary2: "#8637D5",
    primary3: "#8E76AB",
    primary4: "#8637D5",
    primary5: "#4D1E88",

    // color text
    primaryText1: "#6da8ff",

    // secondary colors
    secondary1: "#2172E5",
    secondary2: "#17000b26",
    secondary3: "#17000b26",

    // other
    red1: "#FF6871",
    red2: "#F82D3A",
    green1: "#2EBD67",
    yellow1: "#FFE270",
    yellow2: "#F3841E",
    blue1: "#04C1DB",

    //backgroundGradientColor
    bgColor1: "#2F2E3A",
    bgColor2: "#1C1C2A",
    bodyWrapper: "#0C0B1B",
    bodyWrapperLine: "#0C0B1B"
  };
}

export function theme(darkMode: boolean): DefaultTheme {
  return darkMode
    ? {
        ...darkColors(),

        grids: {
          sm: 8,
          md: 12,
          lg: 24
        },

        //shadows
        shadow1: "#000",

        // media queries
        mediaWidth: mediaWidthTemplates,

        // css snippets
        flexColumnNoWrap: css`
          display: flex;
          flex-flow: column nowrap;
        `,
        flexRowNoWrap: css`
          display: flex;
          flex-flow: row nowrap;
        `
      }
    : {
        ...lightColors(),

        grids: {
          sm: 8,
          md: 12,
          lg: 24
        },

        //shadows
        shadow1: "#000",

        // media queries
        mediaWidth: mediaWidthTemplates,

        // css snippets
        flexColumnNoWrap: css`
          display: flex;
          flex-flow: column nowrap;
        `,
        flexRowNoWrap: css`
          display: flex;
          flex-flow: row nowrap;
        `
      };
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode();
  const themeObject = theme(darkMode);

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>;
}

const TextWrapper = styled(Text)<{ color: keyof Colors }>`
  color: ${({ color, theme }) => (theme as any)[color]};
`;

export const TYPE = {
  main(props: TextProps) {
    return <TextWrapper fontWeight={500} color={"text2"} {...props} />;
  },
  link(props: TextProps) {
    return <TextWrapper fontWeight={500} color={"primary1"} {...props} />;
  },
  black(props: TextProps) {
    return <TextWrapper fontWeight={500} color={"text1"} {...props} />;
  },
  body(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} color={"text1"} {...props} />;
  },
  largeHeader(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={24} {...props} />;
  },
  mediumHeader(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={20} {...props} />;
  },
  subHeader(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} {...props} />;
  },
  blue(props: TextProps) {
    return <TextWrapper fontWeight={500} color={"primary1"} {...props} />;
  },
  yellow(props: TextProps) {
    return <TextWrapper fontWeight={500} color={"yellow1"} {...props} />;
  },
  darkGray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={"text3"} {...props} />;
  },
  gray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={"bg3"} {...props} />;
  },
  italic(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={12} fontStyle={"italic"} color={"text2"} {...props} />;
  },
  error({ error, ...props }: { error: boolean } & TextProps) {
    return <TextWrapper fontWeight={500} color={error ? "red1" : "text2"} {...props} />;
  }
};

export const FixedGlobalStyle = createGlobalStyle`
html, input, textarea, button {
  font-family: 'Roboto', sans-serif;
  letter-spacing: -0.018em;
  font-display: fallback;
  line-height: 1.5;
  border-radius:0;
  -webkit-appearance:none;
}
@supports (font-variation-settings: normal) {
  html, input, textarea, button {
    font-family: 'Roboto', sans-serif;
  }
}


html,
body {
  margin: 0;
  padding: 0;
}
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  list-style: none;
}

button {
  user-select: none;
  &:hover {
    cursor: pointer;
  }
}
a {
  &:hover {
    cursor: pointer;
  }
}

.blind {
  overflow: hidden;
  position: absolute;
  font-size: 0;
  line-height: 0;
  text-indent: -9999px;
}

html {
  font-size: 16px;
  font-variant: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
`;
//background-color: ${({ theme }) => theme.bg2};
export const ThemedGlobalStyle = createGlobalStyle`
html {
}
body {
  min-height: 100vh;
  /* background-image: ${({ theme }) =>
    `linear-gradient(180deg,  ${theme.bgColor1} 38.02%, ${theme.bgColor2} 94.79%)`}; */
  background-image: ${({ theme }) => theme.gradientBg};
}
`;
