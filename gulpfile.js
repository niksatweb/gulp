const { parallel, series, dest, src, watch } = require("gulp");
const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const browserSync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const clean = require("gulp-clean");
const avif = require("gulp-avif");
const webp = require("gulp-webp");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const svgSprite = require("gulp-svg-sprite");
const ttf2woff2 = require("gulp-ttf2woff2");
const fonter = require("gulp-fonter");
const include = require("gulp-include");

function includeHtmls() {
  return src(["app/pages/*.html"])
    .pipe(include({ includePaths: "app/components" }))
    .pipe(dest("app"))
    .pipe(browserSync.stream());
}

function fonts() {
  return src("app/fonts/src/*.*")
    .pipe(
      fonter({
        formats: ["woff", "ttf"],
      })
    )
    .pipe(src("app/fonts/*.ttf"))
    .pipe(ttf2woff2())
    .pipe(dest("app/fonts"));
}

function images() {
  return src(["app/images/src/*.*", "!app/images/src/*.svg"])
    .pipe(newer("app/images"))
    .pipe(avif({ quality: 50 }))
    .pipe(src("app/images/src/*.*"))
    .pipe(newer("app/images"))
    .pipe(webp())
    .pipe(src("app/images/src/*.*"))
    .pipe(newer("app/images"))
    .pipe(imagemin())
    .pipe(dest("app/images"));
}

function sprite() {
  return src(["app/images/src/*.svg"])
    .pipe(
      svgSprite({
        mode: { stack: { sprite: "../sprite.svg", example: true } },
      })
    )
    .pipe(dest("app/images"));
}

function styles() {
  return src(["app/scss/stylesReset.scss", "app/scss/styles.scss"])
    .pipe(autoprefixer({ overrideBrowserlist: ["last 10 versions"] }))
    .pipe(concat("styles.min.css"))
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(dest("app/css"))
    .pipe(browserSync.stream());
}

function scripts() {
  return src("app/js/main.js")
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("app/js"))
    .pipe(browserSync.stream());
}

function watching() {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
  });
  watch(["app/scss/styles.scss"], styles);
  watch(["app/js/main.js"], scripts);
  watch(["app/images/src"], images);
  watch(["app/components", "app/pages"], includeHtmls);
  watch(["app/*.html"]).on("change", browserSync.reload);
}

function browsing() {}

function building() {
  return src(
    [
      "app/*.html",
      "app/css/styles.min.css",
      "app/js/main.min.js",
      "app/fonts/*.*",
      "app/images/*.*",
      "!app/images/*.svg",
      "!app/images/stack/*.*",
      "app/images/sprite.svg",
    ],
    { base: "app" }
  ).pipe(dest("dist/"));
}

function cleanDist() {
  return src("dist").pipe(clean());
}

exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.browsing = browsing;
exports.images = images;
exports.sprite = sprite;
exports.fonts = fonts;
exports.building = building;
exports.includeHtmls = includeHtmls;

exports.build = series(cleanDist, building);
exports.default = parallel(
  styles,
  images,
  scripts,
  sprite,
  includeHtmls,
  watching
);
