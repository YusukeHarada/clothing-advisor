/**
 * 5.1 体感温度補正
 * MVPは風速・湿度による補正を実装する。日射・雨は段階的に追加する（雨は5.1のisRainyフラグとして別途扱う）。
 */
export interface FeelsLikeInput {
  temp: number;
  windSpeed: number;
  humidity: number;
}

/**
 * 風速補正。Missenard の体感式を用い、風速が大きいほど体感気温を下げる。
 * Te = 33 - (33 - T) * (0.474 + 0.454*sqrt(v) - 0.0454*v)
 */
function applyWindChill(temp: number, windSpeed: number): number {
  if (windSpeed <= 0) return temp;
  const factor = 0.474 + 0.454 * Math.sqrt(windSpeed) - 0.0454 * windSpeed;
  return 33 - (33 - temp) * factor;
}

/**
 * 湿度補正。夏（気温25℃以上）は高湿度で暑さを増幅し、冬（気温10℃以下）は高湿度で寒さを増幅する。
 * 基準湿度60%からの差分に応じて線形に補正する。
 */
function applyHumidity(temp: number, humidity: number): number {
  const humidityDelta = humidity - 60;
  if (temp >= 25) {
    return temp + Math.max(0, humidityDelta) * 0.03;
  }
  if (temp <= 10) {
    return temp - Math.max(0, humidityDelta) * 0.02;
  }
  return temp;
}

export function computeFeelsLikeTemp({ temp, windSpeed, humidity }: FeelsLikeInput): number {
  const afterWind = applyWindChill(temp, windSpeed);
  const afterHumidity = applyHumidity(afterWind, humidity);
  return Math.round(afterHumidity * 10) / 10;
}
