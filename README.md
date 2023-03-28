# @js-lion/i18n-tools

## 功能

- 以 xlsx 格式导出双语文件 
- 解析 xlsx 文件，导入议员调整后的双语文件

## 安装

```
pnpm install @js-lion/i18n-tools
```

## 配置

package.json 或者 i18n.config.json 任选其一, package.json 优先级最高

**package.json**
```
{
  "i18n": {
    "langs": "src/langs", // 双语文件目录
    "language": {         // 支持的语言类型
      "auto": "en",       // 默认语言，导出时会在第一栏
      "cn": "cn",
      "en": "en"
    },
  }
}
```

**i18n.config.json**
```
{
    "langs": "src/langs",
    "language": {
      "auto": "en",
      "cn": "cn",
      "en": "en"
    },
  }
```

## 导出
```
i18n --export ./langs.xlsx
```


## 导入
```
i18n --import ./langs.xlsx
```