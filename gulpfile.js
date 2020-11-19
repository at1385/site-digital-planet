'use strict';

let buildFolder = require('path').basename(`${__dirname}_build`);
let sourceFolder = 'source';

const path = {
  build: {
    root: `${buildFolder}/`,
    css: `${buildFolder}/css/`,
    js: `${buildFolder}/js/`,
    img: `${buildFolder}/img/`,
    fonts: `${buildFolder}/fonts/`
  },
  source: {
    html: [`${sourceFolder}/*.html`, `!${sourceFolder}/_*.html`],
    sass: `${sourceFolder}/sass/style.scss`,
    js: `${sourceFolder}/js/script.js`,
    img: `${sourceFolder}/img/*.{jpg,png,svg,gif,ico,webp}`,
    fonts: `${sourceFolder}/fonts/**/*.{woff,woff2}`,
  },
  monitor: {
    html: `${sourceFolder}/**/*.html`,
    css: `${sourceFolder}/sass/**/*.scss`,
    js: `${sourceFolder}/js/**/*.js`,
    img: `${sourceFolder}/img/`
  }
}

const {src, dest, parallel, series, watch} = require('gulp');
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');
const fileInclude = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const groupMedia = require('gulp-group-css-media-queries');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;

function watchFiles() {
  browserSync.init({
    server: {
      baseDir: path.build.root
    },
    notify: false
  });

  watch([path.monitor.html], html);
  watch([path.monitor.css], css);
  watch([path.monitor.js], js);
  watch([path.monitor.img], img);
}

function html() {
  return src(path.source.html)
    .pipe(plumber())
    .pipe(dest(path.build.root))
    .pipe(browserSync.stream());
}

function css() {
  return src(path.source.sass)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(rename('style.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(path.build.css))
    .pipe(browserSync.stream());
}

function js() {
  return src(path.source.js)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(fileInclude())
    .pipe(rename('script.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(path.build.js))
    .pipe(browserSync.stream());
}

function img() {
  return src(path.source.img)
    .pipe(dest(path.build.img))
    .pipe(browserSync.stream());
}

function fonts() {
  return src(path.source.fonts)
    .pipe(dest(path.build.fonts));
}

function delBuild() {
  return del(path.build.root);
}

function delImg() {
  return del(path.build.img);
}

exports.watchFiles = watchFiles;
exports.html = html;
exports.css = css;
exports.js = js;
exports.img = img;
exports.fonts = fonts;
exports.delBuild = delBuild;
exports.delImg = delImg;

exports.default = series(delBuild, html, css, js, img, fonts, watchFiles);

function buildHtml() {
  return src(path.source.html)
    .pipe(plumber())
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(dest(path.build.root));
}

function buildCss() {
  return src(path.source.sass)
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(groupMedia())
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(dest(path.build.css));
}

function buildJs() {
  return src(path.source.js)
    .pipe(plumber())
    .pipe(fileInclude())
    .pipe(uglify())
    .pipe(rename('script.min.js'))
    .pipe(dest(path.build.js));
}

exports.buildHtml = buildHtml;
exports.buildCss = buildCss;
exports.buildCss = buildJs;

exports.build = series(delBuild, buildHtml, buildCss, buildJs, img, fonts);
