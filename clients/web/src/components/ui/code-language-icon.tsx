import TablerIcon from "../app/tabler-icon";
import {
  IconBrandCss3,
  IconBrandGolang,
  IconBrandHtml5,
  IconBrandJavascript,
  IconBrandPhp,
  IconBrandPython,
  IconBrandRust,
  IconBrandSass,
  IconBrandTypescript,
  IconCode,
  IconJson,
  IconTerminal2,
  type Icon,
} from "@tabler/icons-react";

export default function CodeLanguageIcon({ language }: { language: string }) {
  let CodeIcon: Icon = IconCode;
  switch (language) {
    case "typescript":
    case "tsx":
    case "ts":
      CodeIcon = IconBrandTypescript;
      break;

    case "javascript":
    case "jsx":
    case "js":
      CodeIcon = IconBrandJavascript;
      break;

    case "python":
      CodeIcon = IconBrandPython;
      break;

    case "bash":
      CodeIcon = IconTerminal2;
      break;

    case "html":
      CodeIcon = IconBrandHtml5;
      break;

    case "css":
      CodeIcon = IconBrandCss3;
      break;

    case "sass":
      CodeIcon = IconBrandSass;
      break;

    case "json":
      CodeIcon = IconJson;
      break;

    case "golang":
    case "go":
      CodeIcon = IconBrandGolang;
      break;

    case "rust":
    case "rs":
      CodeIcon = IconBrandRust;
      break;

    case "php":
      CodeIcon = IconBrandPhp;
      break;

    default:
      return null;
  }
  return (
    <TablerIcon Icon={CodeIcon} className="text-muted-foreground size-4" />
  );
}
