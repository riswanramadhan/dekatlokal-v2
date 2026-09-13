// @vitest-environment jsdom
import { createElement, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { RegionPicker } from "@/components/digital-checkup/region-picker";
afterEach(cleanup);
function Wrapper(){
  const [location,setLocation]=useState({provinceCode:"",cityCode:""});
  return createElement(RegionPicker,{...location,onChange:(provinceCode,cityCode)=>setLocation({provinceCode,cityCode})});
}
it("searches province/city, resolves Sidrap, and resets eligibility on province change",()=>{
  render(createElement(Wrapper));
  const province=screen.getByRole("combobox",{name:"Provinsi"}),city=screen.getByRole("combobox",{name:"Kota / kabupaten"});
  expect(city.hasAttribute("disabled")).toBe(true);
  fireEvent.focus(province);fireEvent.change(province,{target:{value:"Sulawesi Selatan"}});
  fireEvent.click(screen.getByRole("option",{name:"Sulawesi Selatan"}));
  fireEvent.focus(city);fireEvent.change(city,{target:{value:"Sidrap"}});
  fireEvent.click(screen.getByRole("option",{name:"Kabupaten Sidenreng Rappang"}));
  expect(screen.getByText("Berpotensi dapat program website gratis")).toBeTruthy();
  fireEvent.focus(province);fireEvent.change(province,{target:{value:"Aceh"}});fireEvent.click(screen.getByRole("option",{name:"Aceh"}));
  expect(screen.queryByText("Berpotensi dapat program website gratis")).toBeNull();
  expect((city as HTMLInputElement).value).toBe("");
  expect(screen.getByText(/Di mana pun usahamu/)).toBeTruthy();
});
it("supports keyboard selection and exposes a safe program link",()=>{
  render(createElement(Wrapper));
  const province=screen.getByRole("combobox",{name:"Provinsi"});
  fireEvent.focus(province);fireEvent.change(province,{target:{value:"Bali"}});fireEvent.keyDown(province,{key:"Enter"});
  expect((province as HTMLInputElement).value).toBe("Bali");
  expect(province.getAttribute("aria-expanded")).toBe("false");
  const link=screen.getByRole("link",{name:/Lihat daerah/});
  expect(link.getAttribute("href")).toBe("https://www.dekatlokal.com/digital-checkup");
  expect(link.getAttribute("rel")).toContain("noopener");
});
