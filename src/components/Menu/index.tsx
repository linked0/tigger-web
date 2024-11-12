import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ReactComponent as MenuIcon } from "../../assets/images/menu.svg";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import useToggle from "../../hooks/useToggle";
import { withTranslation } from "react-i18next";

import { ExternalLink } from "../../theme";
import { BiFoodMenu, BiGlobe, BiPhoneCall, BiTone } from "react-icons/bi";
import { FiMoon, FiSun } from "react-icons/fi";
import { useDarkModeManager } from "../../state/user/hooks";
import InputCheckOn from "../../assets/images/form/inp-check-pur-on.png";

const StyledMenuIcon = styled(MenuIcon)`
  path {
    stroke: ${({ theme }) => theme.text1};
  }
`;

const StyledMenuButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 38px;
  height: 38px;
  padding: 0.15rem 0.5rem;
  border: 1px solid ${({ theme }) => theme.purpleBoxline1};
  border-radius: 38px;
  background-color: ${({ theme }) => theme.white};
  svg > * {
    stroke: ${({ theme }) => theme.purple1};
  }
  :hover,
  :focus {
    cursor: pointer;
    box-sizing: border-box;
    box-shadow: 1px 2px 2px rgba(98, 57, 150, 0.3);
    background: ${({ theme }) => theme.purpleBg};
  }
`;

const StyledMenu = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
  background-color: transparent;
`;

const MenuFlyout = styled.ul`
  min-width: 12.125rem;
  background-color: ${({ theme }) => theme.white};
  border: 1px solid ${({ theme }) => theme.purpleBtline};
  box-sizing: border-box;
  box-shadow: 12px 12px 28px -10px rgba(62, 31, 92, 0.1);
  border-radius: 20px;
  padding: 0 0.8rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 2.5rem;
  right: 0rem;
  z-index: 100;
`;
const MenuLi = styled.li`
  padding: 0.4rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.purpleBg};
  :last-child {
    border-bottom: none;
  }
`;

const MenuItem = styled(ExternalLink)`
  display: block;
  flex: 1;
  padding: 0.2rem 0.5rem;
  color: ${({ theme }) => theme.text2};
  :hover {
    color: ${({ theme }) => theme.purple2};
    cursor: pointer;
    text-decoration: none;
  }
  > svg {
    display: inline-block;
    vertical-align: middle;
    margin: -3px 10px 0 0;
    color: ${({ theme }) => theme.purple3};
  }
`;

const MenuItemTitle = styled.div`
  display: block;
  flex: 1;
  padding: 0.2rem 0.5rem;
  cursor: default;
  color: ${({ theme }) => theme.text2};
  > svg {
    display: inline-block;
    vertical-align: middle;
    margin: -3px 10px 0 0;
    color: ${({ theme }) => theme.purple3};
  }
`;

const LangWrap = styled.ul`
  margin-top: 0.6rem;
  li {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.1rem 1rem;
  }
  input {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    width: 0;
    height: 0;
    &:checked + label {
      color: ${({ theme }) => theme.purple1};
      ::after {
        background: ${({ theme }) => theme.purple2} url(${InputCheckOn}) no-repeat 50% 50% / contain;
      }
    }
  }
  label {
    display: block;
    width: 100%;
    padding: 0.27rem 1.3rem;
    font-weight: 400;
    font-size: 13px;
    color: ${({ theme }) => theme.purple3};
    box-sizing: border-box;
    cursor: pointer;
    &::after {
      content: "";
      position: absolute;
      top: 50%;
      right: 13px;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      border-radius: 2px;
      border: 1px solid ${({ theme }) => theme.purple3};
      background: ${({ theme }) => theme.white};
    }
  }
`;

const ModWrap = styled.ul`
  display: flex;
  margin-top: 0.6rem;
  padding: 0 0.8rem 0 2rem;
  li {
    width: 50%;
    :first-child label {
      border-radius: 5px 0 0 5px;
    }
    :last-child label {
      border-radius: 0px 5px 5px 0px;
    }
  }
  input {
    overflow: hidden;
    position: absolute;
    width: 0;
    height: 0;
    :checked + label {
      background: ${({ theme }) => theme.purple2};
      border: 1px solid ${({ theme }) => theme.purple3};
      color: ${({ theme }) => theme.white};
    }
  }
  label {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 30px;
    background: ${({ theme }) => theme.white};
    border: 1px solid ${({ theme }) => theme.purple2};
    box-sizing: border-box;
    /* text-indent: -9999px; */
    color: ${({ theme }) => theme.purple2};
    font-size: 17px;
    font-weight: 600;
    cursor: pointer;
    :hover {
      background: ${({ theme }) => theme.purpleBg};
    }
  }
`;

const TxtCopyright = styled.p`
  padding: 0.3rem 0 0.5rem;
  font-weight: 300;
  font-size: 11px;
  color: #8637d5;
  text-align: center;
  cursor: pointer;
`;
const isMultiLanguage: boolean = process.env.REACT_APP_MULTI_LANGUAGE === "true" ? true : false ?? false;

function Menu({ handlerTerms, t, i18n }: any) {
  const node = useRef<HTMLDivElement>();
  const [open, toggle] = useToggle(false);

  useOnClickOutside(node, open ? toggle : undefined);

  const [darkMode, toggleSetDarkMode] = useDarkModeManager();
  const [locale, setLocale] = useState(i18n.language);

  const themeChange = (e: any) => {
    if (darkMode) {
      if (e.target.value === "light") toggleSetDarkMode();
    } else {
      if (e.target.value === "dark") toggleSetDarkMode();
    }
  };

  const handleLanguageChange = (e: any) => {
    setLocale(e.target.value);
  };

  useEffect(() => {
    if (locale && typeof locale === "string") {
      i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  return (
    <StyledMenu ref={node as any}>
      <StyledMenuButton onClick={toggle}>
        <StyledMenuIcon />
      </StyledMenuButton>
      {open && (
        <MenuFlyout>
          <MenuLi>
            <MenuItem href="https://bosagora.github.io/docs-biznet/en/boa_swap/introduction">
              <BiFoodMenu size={18} />
              {t("docs")}
            </MenuItem>
          </MenuLi>
          {/*<MenuLi>*/}
          {/*  <MenuItem href="https://github.com/bosagora">*/}
          {/*    <BiMessageDetail size={18} />*/}
          {/*    {t("FAQ")}*/}
          {/*  </MenuItem>*/}
          {/*</MenuLi>*/}
          <MenuLi>
            <MenuItem href="https://t.me/bosagora_eng">
              <BiPhoneCall size={18} />
              {t("community")}
            </MenuItem>
          </MenuLi>
          {isMultiLanguage && (
            <MenuLi>
              <MenuItem href="https://github.com/bosagora">
                <BiGlobe size={18} />
                {t("language")}
              </MenuItem>
              <LangWrap>
                <li>
                  <input
                    type="radio"
                    id="eng"
                    name="lang"
                    value="en"
                    onChange={handleLanguageChange}
                    checked={locale === "en"}
                  />
                  <label htmlFor="eng">{t("english")}</label>
                </li>
                <li>
                  <input
                    type="radio"
                    id="ko"
                    name="lang"
                    value="ko"
                    onChange={handleLanguageChange}
                    checked={locale === "ko"}
                  />
                  <label htmlFor="ko">{t("korean")}</label>
                </li>
              </LangWrap>
            </MenuLi>
          )}
          <MenuLi>
            <MenuItemTitle>
              <BiTone size={18} />
              {t("theme")}
            </MenuItemTitle>
            <ModWrap>
              <li>
                <input type="radio" name="mode" id="modeDark" onChange={themeChange} value="dark" checked={darkMode} />
                <label htmlFor="modeDark">
                  <FiMoon />
                </label>
              </li>
              <li>
                <input
                  type="radio"
                  name="mode"
                  id="modeLight"
                  onChange={themeChange}
                  value="light"
                  checked={!darkMode}
                />
                <label htmlFor="modeLight">
                  <FiSun />
                </label>
              </li>
            </ModWrap>
          </MenuLi>
          <MenuLi>
            <TxtCopyright onClick={handlerTerms}>{t("termsOfService")}</TxtCopyright>
          </MenuLi>
        </MenuFlyout>
      )}
    </StyledMenu>
  );
}

export default withTranslation()(Menu);
