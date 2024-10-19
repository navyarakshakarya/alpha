const charMap: { [key: string]: string } = {
  "!": "%21",
  "'": "%27",
  "(": "%28",
  ")": "%29",
  "*": "%2A",
  " ": "+",
  "@": "%40",
  $: "%24",
  ",": "%2C",
  ":": "%3A",
  ";": "%3B",
  "=": "%3D",
  "/": "%2F",
  "&": "%26",
  "#": "%23",
};

export const toUri = (str: string) => 
  encodeURIComponent(str.toLowerCase()) // Convert to lowercase first
    .replace(/[!'\(\)\*\s@$,;:=\/&#]/g, (match) => charMap[match] || match); // Fallback to match if undefined
