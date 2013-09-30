/*! Bible Reference Parser - v0.0.2 - 2013-09-30
* https://github.com/bibliaolvaso/reference
* Copyright (c) 2013 Laszlo Bacsi <lackac@lackac.hu>; Licensed MIT */
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

(function(root) {

  var ReferenceIndex = {
    bibles: {
      ujforditas: {
        id: "ujforditas",
        lang: "hu",
        name: "Protestáns új fordítás",
        copyright: "Az 1975-ben megjelent, 1990-ben revideált új fordítású Biblia szövege. Felhasználása a Magyar Bibliatársulat engedélyével.",
        first_published_in: 1975,
        short_name: "Új fordítás"
      },
      karoli: {
        id: "karoli",
        lang: "hu",
        name: "Károli Biblia",
        short_name: "Károli",
        first_published_in: 1590,
        copyright: "Károli Gáspár 1590-ben megjelent fordításának 1908-ban revideált változata."
      }
    },
    books: [{
      karoli: {
        id: "karoli_01",
        bible: "karoli",
        index: 1,
        title: "Mózes I. könyve",
        abbr: "1Móz",
        chapters: 50,
        testament: "old",
        slugs: ["1moz", "1mozes", "genezis"]
      },
      ujforditas: {
        id: "ujforditas_01",
        bible: "ujforditas",
        index: 1,
        title: "Mózes első könyve (Genezis)",
        abbr: "1Móz",
        chapters: 50,
        testament: "old",
        slugs: ["1moz", "1mozes", "genezis"]
      }
    }, {
      karoli: {
        id: "karoli_02",
        bible: "karoli",
        index: 2,
        title: "Mózes II. könyve",
        abbr: "2Móz",
        chapters: 40,
        testament: "old",
        slugs: ["2moz", "2mozes", "exodus"]
      },
      ujforditas: {
        id: "ujforditas_02",
        bible: "ujforditas",
        index: 2,
        title: "Mózes második könyve (Exodus)",
        abbr: "2Móz",
        chapters: 40,
        testament: "old",
        slugs: ["2moz", "2mozes", "exodus"]
      }
    }, {
      karoli: {
        id: "karoli_03",
        bible: "karoli",
        index: 3,
        title: "Mózes III. könyve",
        abbr: "3Móz",
        chapters: 27,
        testament: "old",
        slugs: ["3moz", "3mozes", "leviticus"]
      },
      ujforditas: {
        id: "ujforditas_03",
        bible: "ujforditas",
        index: 3,
        title: "Mózes harmadik könyve (Leviticus)",
        abbr: "3Móz",
        chapters: 27,
        testament: "old",
        slugs: ["3moz", "3mozes", "leviticus"]
      }
    }, {
      karoli: {
        id: "karoli_04",
        bible: "karoli",
        index: 4,
        title: "Mózes IV. könyve",
        abbr: "4Móz",
        chapters: 36,
        testament: "old",
        slugs: ["4moz", "4mozes", "numeri"]
      },
      ujforditas: {
        id: "ujforditas_04",
        bible: "ujforditas",
        index: 4,
        title: "Mózes negyedik könyve (Numeri)",
        abbr: "4Móz",
        chapters: 36,
        testament: "old",
        slugs: ["4moz", "4mozes", "numeri"]
      }
    }, {
      karoli: {
        id: "karoli_05",
        bible: "karoli",
        index: 5,
        title: "Mózes V. könyve",
        abbr: "5Móz",
        chapters: 34,
        testament: "old",
        slugs: ["5moz", "5mozes", "deuteronomium"]
      },
      ujforditas: {
        id: "ujforditas_05",
        bible: "ujforditas",
        index: 5,
        title: "Mózes ötödik könyve (Deuteronomium)",
        abbr: "5Móz",
        chapters: 34,
        testament: "old",
        slugs: ["5moz", "5mozes", "deuteronomium"]
      }
    }, {
      karoli: {
        id: "karoli_06",
        bible: "karoli",
        index: 6,
        title: "Józsué könyve",
        abbr: "Józs",
        chapters: 24,
        testament: "old",
        slugs: ["jozs", "jozsue"]
      },
      ujforditas: {
        id: "ujforditas_06",
        bible: "ujforditas",
        index: 6,
        title: "Józsué könyve",
        abbr: "Józs",
        chapters: 24,
        testament: "old",
        slugs: ["jozs", "jozsue"]
      }
    }, {
      karoli: {
        id: "karoli_07",
        bible: "karoli",
        index: 7,
        title: "Bírák könyve",
        abbr: "Bír",
        chapters: 21,
        testament: "old",
        slugs: ["bir", "birak"]
      },
      ujforditas: {
        id: "ujforditas_07",
        bible: "ujforditas",
        index: 7,
        title: "A bírák könyve",
        abbr: "Bír",
        chapters: 21,
        testament: "old",
        slugs: ["bir", "birak"]
      }
    }, {
      karoli: {
        id: "karoli_08",
        bible: "karoli",
        index: 8,
        title: "Ruth könyve",
        abbr: "Ruth",
        chapters: 4,
        testament: "old",
        slugs: ["ruth"]
      },
      ujforditas: {
        id: "ujforditas_08",
        bible: "ujforditas",
        index: 8,
        title: "Ruth könyve",
        abbr: "Ruth",
        chapters: 4,
        testament: "old",
        slugs: ["ruth"]
      }
    }, {
      karoli: {
        id: "karoli_09",
        bible: "karoli",
        index: 9,
        title: "Sámuel I. könyve",
        abbr: "1Sám",
        chapters: 31,
        testament: "old",
        slugs: ["1sam", "1samuel"]
      },
      ujforditas: {
        id: "ujforditas_09",
        bible: "ujforditas",
        index: 9,
        title: "Sámuel első könyve",
        abbr: "1Sám",
        chapters: 31,
        testament: "old",
        slugs: ["1sam", "1samuel"]
      }
    }, {
      karoli: {
        id: "karoli_10",
        bible: "karoli",
        index: 10,
        title: "Sámuel II. könyve",
        abbr: "2Sám",
        chapters: 24,
        testament: "old",
        slugs: ["2sam", "2samuel"]
      },
      ujforditas: {
        id: "ujforditas_10",
        bible: "ujforditas",
        index: 10,
        title: "Sámuel második könyve",
        abbr: "2Sám",
        chapters: 24,
        testament: "old",
        slugs: ["2sam", "2samuel"]
      }
    }, {
      karoli: {
        id: "karoli_11",
        bible: "karoli",
        index: 11,
        title: "Királyok I. könyve",
        abbr: "1Kir",
        chapters: 22,
        testament: "old",
        slugs: ["1kir", "1kiralyok"]
      },
      ujforditas: {
        id: "ujforditas_11",
        bible: "ujforditas",
        index: 11,
        title: "A királyok első könyve",
        abbr: "1Kir",
        chapters: 22,
        testament: "old",
        slugs: ["1kir", "1kiralyok"]
      }
    }, {
      karoli: {
        id: "karoli_12",
        bible: "karoli",
        index: 12,
        title: "Királyok II. könyve",
        abbr: "2Kir",
        chapters: 25,
        testament: "old",
        slugs: ["2kir", "2kiralyok"]
      },
      ujforditas: {
        id: "ujforditas_12",
        bible: "ujforditas",
        index: 12,
        title: "A királyok második könyve",
        abbr: "2Kir",
        chapters: 25,
        testament: "old",
        slugs: ["2kir", "2kiralyok"]
      }
    }, {
      karoli: {
        id: "karoli_13",
        bible: "karoli",
        index: 13,
        title: "Krónika I. könyve",
        abbr: "1Krón",
        chapters: 29,
        testament: "old",
        slugs: ["1kron", "1kronika", "1kronikak"]
      },
      ujforditas: {
        id: "ujforditas_13",
        bible: "ujforditas",
        index: 13,
        title: "A krónikák első könyve",
        abbr: "1Krón",
        chapters: 29,
        testament: "old",
        slugs: ["1kron", "1kronikak", "1kronika"]
      }
    }, {
      karoli: {
        id: "karoli_14",
        bible: "karoli",
        index: 14,
        title: "Krónika II. könyve",
        abbr: "2Krón",
        chapters: 36,
        testament: "old",
        slugs: ["2kron", "2kronika", "2kronikak"]
      },
      ujforditas: {
        id: "ujforditas_14",
        bible: "ujforditas",
        index: 14,
        title: "A krónikák második könyve",
        abbr: "2Krón",
        chapters: 36,
        testament: "old",
        slugs: ["2kron", "2kronikak", "2kronika"]
      }
    }, {
      karoli: {
        id: "karoli_15",
        bible: "karoli",
        index: 15,
        title: "Ezsdrás könyve",
        abbr: "Ezsdr",
        chapters: 10,
        testament: "old",
        slugs: ["ezsdr", "ezsdras", "ezsd"]
      },
      ujforditas: {
        id: "ujforditas_15",
        bible: "ujforditas",
        index: 15,
        title: "Ezsdrás könyve",
        abbr: "Ezsd",
        chapters: 10,
        testament: "old",
        slugs: ["ezsd", "ezsdras", "ezsdr"]
      }
    }, {
      karoli: {
        id: "karoli_16",
        bible: "karoli",
        index: 16,
        title: "Nehémiás könyve",
        abbr: "Neh",
        chapters: 13,
        testament: "old",
        slugs: ["neh", "nehemias"]
      },
      ujforditas: {
        id: "ujforditas_16",
        bible: "ujforditas",
        index: 16,
        title: "Nehémiás könyve",
        abbr: "Neh",
        chapters: 13,
        testament: "old",
        slugs: ["neh", "nehemias"]
      }
    }, {
      karoli: {
        id: "karoli_17",
        bible: "karoli",
        index: 17,
        title: "Eszter könyve",
        abbr: "Eszt",
        chapters: 10,
        testament: "old",
        slugs: ["eszt", "eszter"]
      },
      ujforditas: {
        id: "ujforditas_17",
        bible: "ujforditas",
        index: 17,
        title: "Eszter könyve",
        abbr: "Eszt",
        chapters: 10,
        testament: "old",
        slugs: ["eszt", "eszter"]
      }
    }, {
      karoli: {
        id: "karoli_18",
        bible: "karoli",
        index: 18,
        title: "Jób könyve",
        abbr: "Jób",
        chapters: 42,
        testament: "old",
        slugs: ["job"]
      },
      ujforditas: {
        id: "ujforditas_18",
        bible: "ujforditas",
        index: 18,
        title: "Jób könyve",
        abbr: "Jób",
        chapters: 42,
        testament: "old",
        slugs: ["job"]
      }
    }, {
      karoli: {
        id: "karoli_19",
        bible: "karoli",
        index: 19,
        title: "Zsoltárok könyve",
        abbr: "Zsolt",
        chapters: 150,
        testament: "old",
        slugs: ["zsolt", "zsoltarok"]
      },
      ujforditas: {
        id: "ujforditas_19",
        bible: "ujforditas",
        index: 19,
        title: "A zsoltárok könyve",
        abbr: "Zsolt",
        chapters: 150,
        testament: "old",
        slugs: ["zsolt", "zsoltarok"]
      }
    }, {
      karoli: {
        id: "karoli_20",
        bible: "karoli",
        index: 20,
        title: "Példabeszédek",
        abbr: "Péld",
        chapters: 31,
        testament: "old",
        slugs: ["peld", "peldabeszedek"]
      },
      ujforditas: {
        id: "ujforditas_20",
        bible: "ujforditas",
        index: 20,
        title: "A példabeszédek könyve",
        abbr: "Péld",
        chapters: 31,
        testament: "old",
        slugs: ["peld", "peldabeszedek"]
      }
    }, {
      karoli: {
        id: "karoli_21",
        bible: "karoli",
        index: 21,
        title: "Prédikátor könyve",
        abbr: "Préd",
        chapters: 12,
        testament: "old",
        slugs: ["pred", "predikator"]
      },
      ujforditas: {
        id: "ujforditas_21",
        bible: "ujforditas",
        index: 21,
        title: "A prédikátor könyve",
        abbr: "Préd",
        chapters: 12,
        testament: "old",
        slugs: ["pred", "predikator"]
      }
    }, {
      karoli: {
        id: "karoli_22",
        bible: "karoli",
        index: 22,
        title: "Énekek Éneke",
        abbr: "Én",
        chapters: 8,
        testament: "old",
        slugs: ["en", "enekek"]
      },
      ujforditas: {
        id: "ujforditas_22",
        bible: "ujforditas",
        index: 22,
        title: "Énekek éneke",
        abbr: "Énekek",
        chapters: 8,
        testament: "old",
        slugs: ["enekek", "en"]
      }
    }, {
      karoli: {
        id: "karoli_23",
        bible: "karoli",
        index: 23,
        title: "Ésaiás próféta könyve",
        abbr: "Ésa",
        chapters: 66,
        testament: "old",
        slugs: ["esa", "esaias", "ezs", "ezsaias"]
      },
      ujforditas: {
        id: "ujforditas_23",
        bible: "ujforditas",
        index: 23,
        title: "Ézsaiás próféta könyve",
        abbr: "Ézs",
        chapters: 66,
        testament: "old",
        slugs: ["ezs", "ezsaias", "esa", "esaias"]
      }
    }, {
      karoli: {
        id: "karoli_24",
        bible: "karoli",
        index: 24,
        title: "Jeremiás próféta könyve",
        abbr: "Jer",
        chapters: 52,
        testament: "old",
        slugs: ["jer", "jeremias"]
      },
      ujforditas: {
        id: "ujforditas_24",
        bible: "ujforditas",
        index: 24,
        title: "Jeremiás próféta könyve",
        abbr: "Jer",
        chapters: 52,
        testament: "old",
        slugs: ["jer", "jeremias"]
      }
    }, {
      karoli: {
        id: "karoli_25",
        bible: "karoli",
        index: 25,
        title: "Jeremiás siralmai",
        abbr: "Sir",
        chapters: 5,
        testament: "old",
        slugs: ["sir", "siralmak", "jsir"]
      },
      ujforditas: {
        id: "ujforditas_25",
        abbr: "JSir",
        bible: "ujforditas",
        chapters: 5,
        index: 25,
        slugs: ["jsir", "siralmak"],
        testament: "old",
        title: "Jeremiás siralmai"
      }
    }, {
      karoli: {
        id: "karoli_26",
        bible: "karoli",
        index: 26,
        title: "Ezékiel próféta könyve",
        abbr: "Ez",
        chapters: 48,
        testament: "old",
        slugs: ["ez", "ezekiel"]
      },
      ujforditas: {
        id: "ujforditas_26",
        bible: "ujforditas",
        index: 26,
        title: "Ezékiel próféta könyve",
        abbr: "Ez",
        chapters: 48,
        testament: "old",
        slugs: ["ez", "ezekiel"]
      }
    }, {
      karoli: {
        id: "karoli_27",
        bible: "karoli",
        index: 27,
        title: "Dániel próféta könyve",
        abbr: "Dán",
        chapters: 12,
        testament: "old",
        slugs: ["dan", "daniel"]
      },
      ujforditas: {
        id: "ujforditas_27",
        bible: "ujforditas",
        index: 27,
        title: "Dániel próféta könyve",
        abbr: "Dán",
        chapters: 12,
        testament: "old",
        slugs: ["dan", "daniel"]
      }
    }, {
      karoli: {
        id: "karoli_28",
        bible: "karoli",
        index: 28,
        title: "Hóseás próféta könyve",
        abbr: "Hós",
        chapters: 14,
        testament: "old",
        slugs: ["hos", "hoseas"]
      },
      ujforditas: {
        id: "ujforditas_28",
        bible: "ujforditas",
        index: 28,
        title: "Hóseás próféta könyve",
        abbr: "Hós",
        chapters: 14,
        testament: "old",
        slugs: ["hos", "hoseas"]
      }
    }, {
      karoli: {
        id: "karoli_29",
        bible: "karoli",
        index: 29,
        title: "Jóel próféta könyve",
        abbr: "Jóel",
        chapters: 3,
        testament: "old",
        slugs: ["joel"]
      },
      ujforditas: {
        id: "ujforditas_29",
        bible: "ujforditas",
        index: 29,
        title: "Jóel próféta könyve",
        abbr: "Jóel",
        chapters: 4,
        testament: "old",
        slugs: ["joel"]
      }
    }, {
      karoli: {
        id: "karoli_30",
        bible: "karoli",
        index: 30,
        title: "Ámós próféta könyve",
        abbr: "Ámós",
        chapters: 9,
        testament: "old",
        slugs: ["amos", "am", "amosz"]
      },
      ujforditas: {
        id: "ujforditas_30",
        bible: "ujforditas",
        index: 30,
        title: "Ámósz próféta könyve",
        abbr: "Ám",
        chapters: 9,
        testament: "old",
        slugs: ["am", "amosz", "amos"]
      }
    }, {
      karoli: {
        id: "karoli_31",
        bible: "karoli",
        index: 31,
        title: "Abdiás próféta könyve",
        abbr: "Abd",
        chapters: 1,
        testament: "old",
        slugs: ["abd", "abdias"]
      },
      ujforditas: {
        id: "ujforditas_31",
        bible: "ujforditas",
        index: 31,
        title: "Abdiás próféta könyve",
        abbr: "Abd",
        chapters: 1,
        testament: "old",
        slugs: ["abd", "abdias"]
      }
    }, {
      karoli: {
        id: "karoli_32",
        bible: "karoli",
        index: 32,
        title: "Jónás próféta könyve",
        abbr: "Jón",
        chapters: 4,
        testament: "old",
        slugs: ["jon", "jonas"]
      },
      ujforditas: {
        id: "ujforditas_32",
        bible: "ujforditas",
        index: 32,
        title: "Jónás próféta könyve",
        abbr: "Jón",
        chapters: 4,
        testament: "old",
        slugs: ["jon", "jonas"]
      }
    }, {
      karoli: {
        id: "karoli_33",
        bible: "karoli",
        index: 33,
        title: "Mikeás próféta könyve",
        abbr: "Mik",
        chapters: 7,
        testament: "old",
        slugs: ["mik", "mikeas"]
      },
      ujforditas: {
        id: "ujforditas_33",
        bible: "ujforditas",
        index: 33,
        title: "Mikeás próféta könyve",
        abbr: "Mik",
        chapters: 7,
        testament: "old",
        slugs: ["mik", "mikeas"]
      }
    }, {
      karoli: {
        id: "karoli_34",
        bible: "karoli",
        index: 34,
        title: "Náhum próféta könyve",
        abbr: "Náh",
        chapters: 3,
        testament: "old",
        slugs: ["nah", "nahum"]
      },
      ujforditas: {
        id: "ujforditas_34",
        bible: "ujforditas",
        index: 34,
        title: "Náhum próféta könyve",
        abbr: "Náh",
        chapters: 3,
        testament: "old",
        slugs: ["nah", "nahum"]
      }
    }, {
      karoli: {
        id: "karoli_35",
        bible: "karoli",
        index: 35,
        title: "Habakuk próféta könyve",
        abbr: "Hab",
        chapters: 3,
        testament: "old",
        slugs: ["hab", "habakuk"]
      },
      ujforditas: {
        id: "ujforditas_35",
        bible: "ujforditas",
        index: 35,
        title: "Habakuk próféta könyve",
        abbr: "Hab",
        chapters: 3,
        testament: "old",
        slugs: ["hab", "habakuk"]
      }
    }, {
      karoli: {
        id: "karoli_36",
        bible: "karoli",
        index: 36,
        title: "Sofóniás próféta könyve",
        abbr: "Sof",
        chapters: 3,
        testament: "old",
        slugs: ["sof", "sofonias", "zof", "zofonias"]
      },
      ujforditas: {
        id: "ujforditas_36",
        bible: "ujforditas",
        index: 36,
        title: "Zofóniás próféta könyve",
        abbr: "Zof",
        chapters: 3,
        testament: "old",
        slugs: ["zof", "zofonias", "sof", "sofonias"]
      }
    }, {
      karoli: {
        id: "karoli_37",
        bible: "karoli",
        index: 37,
        title: "Aggeus próféta könyve",
        abbr: "Agg",
        chapters: 2,
        testament: "old",
        slugs: ["agg", "aggeus", "hag", "haggeus"]
      },
      ujforditas: {
        id: "ujforditas_37",
        bible: "ujforditas",
        index: 37,
        title: "Haggeus próféta könyve",
        abbr: "Hag",
        chapters: 2,
        testament: "old",
        slugs: ["hag", "haggeus", "agg", "aggeus"]
      }
    }, {
      karoli: {
        id: "karoli_38",
        bible: "karoli",
        index: 38,
        title: "Zakariás próféta könyve",
        abbr: "Zak",
        chapters: 14,
        testament: "old",
        slugs: ["zak", "zakarias"]
      },
      ujforditas: {
        id: "ujforditas_38",
        bible: "ujforditas",
        index: 38,
        title: "Zakariás próféta könyve",
        abbr: "Zak",
        chapters: 14,
        testament: "old",
        slugs: ["zak", "zakarias"]
      }
    }, {
      karoli: {
        id: "karoli_39",
        bible: "karoli",
        index: 39,
        title: "Malakiás próféta könyve",
        abbr: "Mal",
        chapters: 4,
        testament: "old",
        slugs: ["mal", "malakias"]
      },
      ujforditas: {
        id: "ujforditas_39",
        bible: "ujforditas",
        index: 39,
        title: "Malakiás próféta könyve",
        abbr: "Mal",
        chapters: 3,
        testament: "old",
        slugs: ["mal", "malakias"]
      }
    }, {
      karoli: {
        id: "karoli_40",
        bible: "karoli",
        index: 40,
        title: "Máté Evangyélioma",
        abbr: "Máté",
        chapters: 28,
        testament: "new",
        slugs: ["mate", "mt"]
      },
      ujforditas: {
        id: "ujforditas_40",
        bible: "ujforditas",
        index: 40,
        title: "Máté evangéliuma",
        abbr: "Mt",
        chapters: 28,
        testament: "new",
        slugs: ["mt", "mate"]
      }
    }, {
      karoli: {
        id: "karoli_41",
        bible: "karoli",
        index: 41,
        title: "Márk Evangyélioma",
        abbr: "Márk",
        chapters: 16,
        testament: "new",
        slugs: ["mark", "mk"]
      },
      ujforditas: {
        id: "ujforditas_41",
        bible: "ujforditas",
        index: 41,
        title: "Márk evangéliuma",
        abbr: "Mk",
        chapters: 16,
        testament: "new",
        slugs: ["mk", "mark"]
      }
    }, {
      karoli: {
        id: "karoli_42",
        bible: "karoli",
        index: 42,
        title: "Lukács Evangyélioma",
        abbr: "Luk",
        chapters: 24,
        testament: "new",
        slugs: ["luk", "lukacs", "lk"]
      },
      ujforditas: {
        id: "ujforditas_42",
        bible: "ujforditas",
        index: 42,
        title: "Lukács evangéliuma",
        abbr: "Lk",
        chapters: 24,
        testament: "new",
        slugs: ["lk", "lukacs", "luk"]
      }
    }, {
      karoli: {
        id: "karoli_43",
        bible: "karoli",
        index: 43,
        title: "János Evangyélioma",
        abbr: "Ján",
        chapters: 21,
        testament: "new",
        slugs: ["jan", "janos", "jn"]
      },
      ujforditas: {
        id: "ujforditas_43",
        bible: "ujforditas",
        index: 43,
        title: "János evangéliuma",
        abbr: "Jn",
        chapters: 21,
        testament: "new",
        slugs: ["jn", "janos", "jan"]
      }
    }, {
      karoli: {
        id: "karoli_44",
        abbr: "Csel",
        bible: "karoli",
        chapters: 28,
        index: 44,
        slugs: ["csel", "apostolok", "cselekedetek", "apcsel"],
        testament: "new",
        title: "Apostolok Cselekedetei"
      },
      ujforditas: {
        id: "ujforditas_44",
        abbr: "ApCsel",
        bible: "ujforditas",
        chapters: 28,
        index: 44,
        slugs: ["apcsel", "apostolok", "cselekedetek"],
        testament: "new",
        title: "Az apostolok cselekedetei"
      }
    }, {
      karoli: {
        id: "karoli_45",
        bible: "karoli",
        index: 45,
        title: "Rómabeliekhez írt levél",
        abbr: "Róm",
        chapters: 16,
        testament: "new",
        slugs: ["rom", "romabeliekhez", "romaiakhoz"]
      },
      ujforditas: {
        id: "ujforditas_45",
        bible: "ujforditas",
        index: 45,
        title: "Pál levele a rómaiakhoz",
        abbr: "Róm",
        chapters: 16,
        testament: "new",
        slugs: ["rom", "romaiakhoz", "romabeliekhez"]
      }
    }, {
      karoli: {
        id: "karoli_46",
        bible: "karoli",
        index: 46,
        title: "Korinthusbeliekhez írt I. levél",
        abbr: "1Kor",
        chapters: 16,
        testament: "new",
        slugs: ["1kor", "1korinthusbeliekhez", "1korinthusiakhoz"]
      },
      ujforditas: {
        id: "ujforditas_46",
        bible: "ujforditas",
        index: 46,
        title: "Pál első levele a korinthusiakhoz",
        abbr: "1Kor",
        chapters: 16,
        testament: "new",
        slugs: ["1kor", "1korinthusiakhoz", "1korinthusbeliekhez"]
      }
    }, {
      karoli: {
        id: "karoli_47",
        bible: "karoli",
        index: 47,
        title: "Korinthusbeliekhez írt II. levél",
        abbr: "2Kor",
        chapters: 13,
        testament: "new",
        slugs: ["2kor", "2korinthusbeliekhez", "2korinthusiakhoz"]
      },
      ujforditas: {
        id: "ujforditas_47",
        bible: "ujforditas",
        index: 47,
        title: "Pál második levele a korinthusiakhoz",
        abbr: "2Kor",
        chapters: 13,
        testament: "new",
        slugs: ["2kor", "2korinthusiakhoz", "2korinthusbeliekhez"]
      }
    }, {
      karoli: {
        id: "karoli_48",
        bible: "karoli",
        index: 48,
        title: "Galátziabeliekhez írt levél",
        abbr: "Gal",
        chapters: 6,
        testament: "new",
        slugs: ["gal", "galatziabeliekhez", "galatakhoz"]
      },
      ujforditas: {
        id: "ujforditas_48",
        bible: "ujforditas",
        index: 48,
        title: "Pál levele a galatákhoz",
        abbr: "Gal",
        chapters: 6,
        testament: "new",
        slugs: ["gal", "galatakhoz", "galatziabeliekhez"]
      }
    }, {
      karoli: {
        id: "karoli_49",
        bible: "karoli",
        index: 49,
        title: "Efézusbeliekhez írt levél",
        abbr: "Ef",
        chapters: 6,
        testament: "new",
        slugs: ["ef", "efezusbeliekhez", "efezusiakhoz"]
      },
      ujforditas: {
        id: "ujforditas_49",
        bible: "ujforditas",
        index: 49,
        title: "Pál levele az efezusiakhoz",
        abbr: "Ef",
        chapters: 6,
        testament: "new",
        slugs: ["ef", "efezusiakhoz", "efezusbeliekhez"]
      }
    }, {
      karoli: {
        id: "karoli_50",
        bible: "karoli",
        index: 50,
        title: "Filippibeliekhez írt levél",
        abbr: "Fil",
        chapters: 4,
        testament: "new",
        slugs: ["fil", "filippibeliekhez", "filippiekhez"]
      },
      ujforditas: {
        id: "ujforditas_50",
        bible: "ujforditas",
        index: 50,
        title: "Pál levele a filippiekhez",
        abbr: "Fil",
        chapters: 4,
        testament: "new",
        slugs: ["fil", "filippiekhez", "filippibeliekhez"]
      }
    }, {
      karoli: {
        id: "karoli_51",
        bible: "karoli",
        index: 51,
        title: "Kolossébeliekhez írt levél",
        abbr: "Kol",
        chapters: 4,
        testament: "new",
        slugs: ["kol", "kolossebeliekhez", "kolosseiakhoz"]
      },
      ujforditas: {
        id: "ujforditas_51",
        bible: "ujforditas",
        index: 51,
        title: "Pál levele a kolosséiakhoz",
        abbr: "Kol",
        chapters: 4,
        testament: "new",
        slugs: ["kol", "kolosseiakhoz", "kolossebeliekhez"]
      }
    }, {
      karoli: {
        id: "karoli_52",
        bible: "karoli",
        index: 52,
        title: "Thessalonikabeliekhez írt I. levél",
        abbr: "1Thess",
        chapters: 5,
        testament: "new",
        slugs: ["1thess", "1thessalonikabeliekhez", "1thessz", "1thesszalonikaiakhoz"]
      },
      ujforditas: {
        id: "ujforditas_52",
        bible: "ujforditas",
        index: 52,
        title: "Pál első levele a thesszalonikaiakhoz",
        abbr: "1Thessz",
        chapters: 5,
        testament: "new",
        slugs: ["1thessz", "1thesszalonikaiakhoz", "1thess", "1thessalonikabeliekhez"]
      }
    }, {
      karoli: {
        id: "karoli_53",
        bible: "karoli",
        index: 53,
        title: "Thessalonikabeliekhez írt II. levél",
        abbr: "2Thess",
        chapters: 3,
        testament: "new",
        slugs: ["2thess", "2thessalonikabeliekhez", "2thessz", "2thesszalonikaiakhoz"]
      },
      ujforditas: {
        id: "ujforditas_53",
        bible: "ujforditas",
        index: 53,
        title: "Pál második levele a thesszalonikaiakhoz",
        abbr: "2Thessz",
        chapters: 3,
        testament: "new",
        slugs: ["2thessz", "2thesszalonikaiakhoz", "2thess", "2thessalonikabeliekhez"]
      }
    }, {
      karoli: {
        id: "karoli_54",
        bible: "karoli",
        index: 54,
        title: "Timótheushoz írt I. levél",
        abbr: "1Tim",
        chapters: 6,
        testament: "new",
        slugs: ["1tim", "1timotheushoz", "1timoteushoz"]
      },
      ujforditas: {
        id: "ujforditas_54",
        bible: "ujforditas",
        index: 54,
        title: "Pál első levele timóteushoz",
        abbr: "1Tim",
        chapters: 6,
        testament: "new",
        slugs: ["1tim", "1timoteushoz", "1timotheushoz"]
      }
    }, {
      karoli: {
        id: "karoli_55",
        bible: "karoli",
        index: 55,
        title: "Timótheushoz írt II. levél",
        abbr: "2Tim",
        chapters: 4,
        testament: "new",
        slugs: ["2tim", "2timotheushoz", "2timoteushoz"]
      },
      ujforditas: {
        id: "ujforditas_55",
        bible: "ujforditas",
        index: 55,
        title: "Pál második levele timóteushoz",
        abbr: "2Tim",
        chapters: 4,
        testament: "new",
        slugs: ["2tim", "2timoteushoz", "2timotheushoz"]
      }
    }, {
      karoli: {
        id: "karoli_56",
        bible: "karoli",
        index: 56,
        title: "Titushoz írt levél",
        abbr: "Tit",
        chapters: 3,
        testament: "new",
        slugs: ["tit", "titushoz", "tituszhoz"]
      },
      ujforditas: {
        id: "ujforditas_56",
        bible: "ujforditas",
        index: 56,
        title: "Pál levele tituszhoz",
        abbr: "Tit",
        chapters: 3,
        testament: "new",
        slugs: ["tit", "tituszhoz", "titushoz"]
      }
    }, {
      karoli: {
        id: "karoli_57",
        bible: "karoli",
        index: 57,
        title: "Filemonhoz írt levél",
        abbr: "Filem",
        chapters: 1,
        testament: "new",
        slugs: ["filem", "filemonhoz"]
      },
      ujforditas: {
        id: "ujforditas_57",
        bible: "ujforditas",
        index: 57,
        title: "Pál levele filemonhoz",
        abbr: "Filem",
        chapters: 1,
        testament: "new",
        slugs: ["filem", "filemonhoz"]
      }
    }, {
      karoli: {
        id: "karoli_58",
        bible: "karoli",
        index: 58,
        title: "Zsidókhoz írt levél",
        abbr: "Zsid",
        chapters: 13,
        testament: "new",
        slugs: ["zsid", "zsidokhoz"]
      },
      ujforditas: {
        id: "ujforditas_58",
        bible: "ujforditas",
        index: 58,
        title: "A zsidókhoz írt levél",
        abbr: "Zsid",
        chapters: 13,
        testament: "new",
        slugs: ["zsid", "zsidokhoz"]
      }
    }, {
      karoli: {
        id: "karoli_59",
        bible: "karoli",
        index: 59,
        title: "Jakab Apostol levele",
        abbr: "Jak",
        chapters: 5,
        testament: "new",
        slugs: ["jak", "jakab"]
      },
      ujforditas: {
        id: "ujforditas_59",
        bible: "ujforditas",
        index: 59,
        title: "Jakab levele",
        abbr: "Jak",
        chapters: 5,
        testament: "new",
        slugs: ["jak", "jakab"]
      }
    }, {
      karoli: {
        id: "karoli_60",
        bible: "karoli",
        index: 60,
        title: "Péter Apostol I. levele",
        abbr: "1Pét",
        chapters: 5,
        testament: "new",
        slugs: ["1pet", "1peter", "1pt"]
      },
      ujforditas: {
        id: "ujforditas_60",
        bible: "ujforditas",
        index: 60,
        title: "Péter első levele",
        abbr: "1Pt",
        chapters: 5,
        testament: "new",
        slugs: ["1pt", "1peter", "1pet"]
      }
    }, {
      karoli: {
        id: "karoli_61",
        bible: "karoli",
        index: 61,
        title: "Péter Apostol II. levele",
        abbr: "2Pét",
        chapters: 3,
        testament: "new",
        slugs: ["2pet", "2peter", "2pt"]
      },
      ujforditas: {
        id: "ujforditas_61",
        bible: "ujforditas",
        index: 61,
        title: "Péter második levele",
        abbr: "2Pt",
        chapters: 3,
        testament: "new",
        slugs: ["2pt", "2peter", "2pet"]
      }
    }, {
      karoli: {
        id: "karoli_62",
        bible: "karoli",
        index: 62,
        title: "János Apostol I. levele",
        abbr: "1Ján",
        chapters: 5,
        testament: "new",
        slugs: ["1jan", "1janos", "1jn"]
      },
      ujforditas: {
        id: "ujforditas_62",
        bible: "ujforditas",
        index: 62,
        title: "János első levele",
        abbr: "1Jn",
        chapters: 5,
        testament: "new",
        slugs: ["1jn", "1janos", "1jan"]
      }
    }, {
      karoli: {
        id: "karoli_63",
        bible: "karoli",
        index: 63,
        title: "János Apostol II. levele",
        abbr: "2Ján",
        chapters: 1,
        testament: "new",
        slugs: ["2jan", "2janos", "2jn"]
      },
      ujforditas: {
        id: "ujforditas_63",
        bible: "ujforditas",
        index: 63,
        title: "János második levele",
        abbr: "2Jn",
        chapters: 1,
        testament: "new",
        slugs: ["2jn", "2janos", "2jan"]
      }
    }, {
      karoli: {
        id: "karoli_64",
        bible: "karoli",
        index: 64,
        title: "János Apostol III. levele",
        abbr: "3Ján",
        chapters: 1,
        testament: "new",
        slugs: ["3jan", "3janos", "3jn"]
      },
      ujforditas: {
        id: "ujforditas_64",
        bible: "ujforditas",
        index: 64,
        title: "János harmadik levele",
        abbr: "3Jn",
        chapters: 1,
        testament: "new",
        slugs: ["3jn", "3janos", "3jan"]
      }
    }, {
      karoli: {
        id: "karoli_65",
        bible: "karoli",
        index: 65,
        title: "Júdás Apostol levele",
        abbr: "Júd",
        chapters: 1,
        testament: "new",
        slugs: ["jud", "judas"]
      },
      ujforditas: {
        id: "ujforditas_65",
        bible: "ujforditas",
        index: 65,
        title: "Júdás levele",
        abbr: "Júd",
        chapters: 1,
        testament: "new",
        slugs: ["jud", "judas"]
      }
    }, {
      karoli: {
        id: "karoli_66",
        bible: "karoli",
        index: 66,
        title: "Jelenések könyve",
        abbr: "Jel",
        chapters: 22,
        testament: "new",
        slugs: ["jel", "jelenesek"]
      },
      ujforditas: {
        id: "ujforditas_66",
        bible: "ujforditas",
        index: 66,
        title: "A jelenések könyve",
        abbr: "Jel",
        chapters: 22,
        testament: "new",
        slugs: ["jel", "jelenesek"]
      }
    }]
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReferenceIndex;
  } else if (typeof define === 'function' && define.amd) {
    define('reference-index', function() {
      return ReferenceIndex;
    });
  } else {
    if (root.Reference !== undefined) {
      root.Reference.index = ReferenceIndex;
    } else {
      throw new Error("Load the Reference library before the index");
    }
  }

})(this);
