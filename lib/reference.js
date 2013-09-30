(function(root) {

  function Reference(book, chapter, verses) {
    this.book    = book;
    this.chapter = chapter;
    this.verses  = verses;

    this.bible = book.bible;
    this.id = this.chapter_id = book.id + padWithZeros(chapter);
    this.abbr = book.abbr + ' ' + chapter;
    this.path = buildPath(book, chapter);

    if (verses) {
      this.id   += '_' + verses;
      this.abbr += ':' + verses;
      this.path += '/' + verses;
    }
  }

  Reference.prototype.previousChapter = function() {
    var book;
    if (this.chapter > 1) {
      return new Reference(this.book, this.chapter - 1);
    } else if (book = Reference.book(this.book.bible, this.book.index - 1)) {
      return new Reference(book, book.chapters);
    }
    return null;
  };
  Reference.prototype.prev = Reference.prototype.previousChapter;

  Reference.prototype.nextChapter = function() {
    var book;
    if (this.chapter < this.book.chapters) {
      return new Reference(this.book, this.chapter + 1);
    } else if (book = Reference.book(this.book.bible, this.book.index + 1)) {
      return new Reference(book, 1);
    }
    return null;
  };
  Reference.prototype.next = Reference.prototype.nextChapter;

  // lookup data for various translations
  Reference.index = {};

  // returns metadata for a specific translaction
  Reference.bible = function(bible) {
    return Reference.index.bibles[bible];
  };

  // returns a specific book by index in the specified translation
  Reference.book = function(bible, idx) {
    var book = Reference.index.books[idx-1];
    if (book) return book[bible];
  };

  var NUMBERS_RE  = /^ *(\d+)(?:[ /]+(\d+)(?:[:. /]+([\d, -]+))?)? *$/;
  var FLEXIBLE_RE = /^ *(\d*[. ]*[^\d]+)[ /]*(\d+)?(?:[:. /]+([\d, -]+))? *$/;

  // resolve a Bible reference in the specified translation
  Reference.resolve = function(bible, ref) {
    var parsed, book, chapter, verses, slug, slug_re, matches;

    if ((parsed = ref.match(NUMBERS_RE)) || (parsed = ref.match(FLEXIBLE_RE))) {
      book    = parsed[1];
      chapter = parsed[2];
      verses  = parsed[3];
    }

    if (!book) return;

    chapter = parseInt(chapter || 1);
    if (chapter === 0) return;

    if (book.match(/^\d+$/)) {
      book = Reference.book(bible, parseInt(book));
      if (!book) return;
    } else {
      slug = slugify(book);
      slug_re = new RegExp('^' + slug);
      matches = Reference.index.books.filter(function(book) {
        return book[bible] && book[bible].slugs.some(function(s) { return slug_re.test(s); });
      });

      if (matches.length > 1) {
        // if there are more than one matches find one where the official
        // abbreviation of any translation exactly matches the slug
        matches = matches.filter(function(book) {
          for (var key in book) {
            var slugs = book[key].slugs;
            if (slugs[0] === slug) return true;
          }
          return false;
        });
        if (matches.length !== 1) return;
      }

      if (matches.length === 0) return;

      book = matches[0][bible];
    }

    if (chapter > book.chapters) return;

    return new Reference(book, chapter, verses);
  }

  var vowelmap = {'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ö': 'o', 'ő': 'o', 'ú': 'u', 'ü': 'u', 'ű': 'u'};
  function slugify(s) {
    return s.toLowerCase()
            .replace(/[\s.]+/g, '')
            .split("")
            .map(function(c) { return vowelmap[c] || c; })
            .join("");
  }

  function padWithZeros(n, l) {
    n = n.toString();
    if (l === undefined) l = 3;
    while (n.length < l) {
      n = '0' + n;
    }
    return n;
  }

  function buildPath(book, chapter) {
    if (!book || !chapter) return null;
    if (chapter === -1) chapter = book.chapters;
    return '/' + [book.bible, book.slugs[0], chapter].join('/');
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Reference;
  } else if (typeof define === 'function' && define.amd) {
    define('reference', function() {
      return Reference;
    });
  } else {
    root.Reference = Reference;
  }

})(this);
