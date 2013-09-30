/*global yeoball:false, test:false, ok:false */

(function () {
  'use strict';

  module('Reference instance', {
    setup: function() {
      this.ref = new Reference(Reference.index.books[19].ujforditas, 3, '5-6');
    }
  });

  test("has reference to the bible", function() {
    equal(this.ref.bible, 'ujforditas');
  });

  test("has reference to the book", function() {
    equal(this.ref.book, Reference.index.books[19].ujforditas);
  });

  test("has reference to the chapter", function() {
    equal(this.ref.chapter, 3);
  });

  test("has reference to the verses", function() {
    equal(this.ref.verses, '5-6');
  });

  test("generates the id for the ref", function() {
    equal(this.ref.id, 'ujforditas_20003_5-6');
  });

  test("generates the abbreviation for the ref", function() {
    equal(this.ref.abbr, 'Péld 3:5-6');
  });

  test("generates the canonical path for the ref", function() {
    equal(this.ref.path, '/ujforditas/peld/3/5-6');
  });


  module('#previousChapter');

  test("returns a Reference for the previous chapter", function() {
    var prev = new Reference(Reference.index.books[19].ujforditas, 3, '5-6').previousChapter();
    equal(prev.id, 'ujforditas_20002');
  });

  test("properly crosses book borders", function() {
    var prev = new Reference(Reference.index.books[19].ujforditas, 1).previousChapter();
    equal(prev.id, 'ujforditas_19150');
  });

  test("returns null when there's no previous chapter", function() {
    var prev = new Reference(Reference.index.books[0].ujforditas, 1).previousChapter();
    strictEqual(prev, null);
  });


  module('#nextChapter');

  test("returns a reference for the next chapter", function() {
    var next = new Reference(Reference.index.books[19].ujforditas, 3, '5-6').nextChapter();
    equal(next.id, 'ujforditas_20004');
  });

  test("properly crosses book borders", function() {
    var next = new Reference(Reference.index.books[19].ujforditas, 31).nextChapter();
    equal(next.id, 'ujforditas_21001');
  });

  test("returns null when there's no next chapter", function() {
    var next = new Reference(Reference.index.books[65].ujforditas, 22).nextChapter();
    strictEqual(next, null);
  });


  module('.bible');

  test("returns the bible specified in the argument", function() {
    equal(Reference.bible('karoli'), Reference.index.bibles.karoli);
    equal(Reference.bible('ujforditas'), Reference.index.bibles.ujforditas);
  });

  test("returns undefined if the bible doesn't exist", function() {
    strictEqual(Reference.bible('quran'), undefined);
  });


  module('.book');

  test("returns the book for the translation and index specified in the argument", function() {
    equal(Reference.book('karoli', 19), Reference.index.books[18].karoli);
    equal(Reference.book('karoli', 46), Reference.index.books[45].karoli);
    equal(Reference.book('ujforditas', 19), Reference.index.books[18].ujforditas);
    equal(Reference.book('ujforditas', 46), Reference.index.books[45].ujforditas);
  });

  test("returns undefined if the book doesn't exist", function() {
    strictEqual(Reference.book('karoli', 67), undefined);
    strictEqual(Reference.book('quran', 1), undefined);
  });


  function testExamples(examples) {
    for (var id in examples) {
      var refs = examples[id];
      for (var i = 0; i < refs.length; i++) {
        var ref = refs[i];
        (function(id, ref) {
          var ex = "'" + ref + "'";
          while (ex.length < 18) ex += " ";
          test(ex + ' -> ' + id, function() {
            var bibleRef = Reference.resolve(this.bible, ref);
            equal(bibleRef.id, id);
          });
        })(id, ref);
      }
    }
  }

  module(".resolve('karoli', ...)", {
    setup: function() {
      this.bible = 'karoli';
    }
  });

  testExamples({
    karoli_01001: ["1/1", "1Móz 1", "1 Mózes 1", "Gen 1", "1mó 1", "1. Mózes 1", "1  Móz  1"],
    karoli_05034: ["5/34", "5Móz 34", "5 Mózes 34", "Deu 34", "Deuteronomium 34"],
    karoli_19119: ["19/119", "Zsolt 119", "Zso 119"],
    karoli_23001: ["23/1", "23", "Ézs", "Ézs1", "Ézs 1", "Ésa 1", "Ezs 1"],
    karoli_24016: ["24/16", "Jer 16", "Jeremiás 16"],
    karoli_25003: ["25/3", "Sir 3", "JSir 3", "Siralmak 3"],
    karoli_29003: ["29/3", "Jóel 3"],
    karoli_37001: ["37/1", "Agg 1", "Hag 1", "Aggeus 1", "Haggeus 1"],
    karoli_40001: ["40/1", "Máté 1"],
    karoli_43017: ["43/17", "Ján 17", "Jn 17", "János 17"],
    karoli_62004: ["62/004", "1Ján 4", "1 Jn 4", "1 János 4"],
    karoli_44009: ["44/9", "Csel 9", "ApCsel 9", "Apostolok 9", "Cselekedetek 9"],
    karoli_48005: ["48/5", "Gal 5", "Galata 5", "Galatzia 5"],
    karoli_55004: ["55/4", "2Tim 4", "2 Timotheus 4", "2 Timóteus 4"],
    karoli_61003: ["61/3", "2Pét 3", "2 Péter 3", "2Pt 3"],
    karoli_66022: ["66/22", "Jel 22"]
  });

  module(".resolve('ujforditas', ...)", {
    setup: function() {
      this.bible = 'ujforditas';
    }
  });

  testExamples({
    ujforditas_01001: ["1Móz 1", "1 Mózes 1", "Gen 1", "1mó 1", "1. Mózes 1", "1  Móz  1"],
    ujforditas_05034: ["5Móz 34", "5 Mózes 34", "Deu 34", "Deuteronomium 34"],
    ujforditas_19119: ["19/119", "Zsolt 119", "Zso 119"],
    ujforditas_23001: ["23/1", "23", "Ézs", "Ézs1", "Ézs 1", "Ésa 1", "Ezs 1"],
    ujforditas_24016: ["24/16", "Jer 16", "Jeremiás 16"],
    ujforditas_25003: ["25/3", "Sir 3", "JSir 3", "Siralmak 3"],
    ujforditas_29003: ["29/3", "Jóel 3"],
    ujforditas_37001: ["37/1", "Agg 1", "Hag 1", "Aggeus 1", "Haggeus 1"],
    ujforditas_40001: ["40/1", "Máté 1"],
    ujforditas_43017: ["43/17", "Ján 17", "Jn 17", "János 17"],
    ujforditas_62004: ["62/004", "1Ján 4", "1 Jn 4", "1 János 4"],
    ujforditas_44009: ["44/9", "Csel 9", "ApCsel 9", "Apostolok 9", "Cselekedetek 9"],
    ujforditas_48005: ["48/5", "Gal 5", "Galata 5", "Galatzia 5"],
    ujforditas_55004: ["55/4", "2Tim 4", "2 Timotheus 4", "2 Timóteus 4"],
    ujforditas_61003: ["61/3", "2Pét 3", "2 Péter 3", "2Pt 3"],
    ujforditas_66022: ["66/22", "Jel 22"]
  });


  module('.resolve canonical abbreviations');

  test("resolves correctly for all canonical abbreviations", function() {
    Reference.index.books.forEach(function(book) {
      for (var bible in book) {
        var bookInBible = book[bible],
            abbr = bookInBible.abbr + ' 1',
            resolvedAbbr = Reference.resolve(bible, abbr).abbr;
        strictEqual(resolvedAbbr, abbr);
      }
    });
  });

  module('.resolve invalid inputs');

  test("returns undefined for invalid input", function() {
    strictEqual(Reference.resolve('x',      "Ruth 1"),  undefined);
    strictEqual(Reference.resolve('karoli', "x"),       undefined);
    strictEqual(Reference.resolve('karoli', "Ruth 1x"), undefined);
    strictEqual(Reference.resolve('karoli', "0/0"),     undefined);
    strictEqual(Reference.resolve('karoli', "1/0"),     undefined);
    strictEqual(Reference.resolve('karoli', "1Móz 0"),  undefined);
    strictEqual(Reference.resolve('karoli', "5/35"),    undefined);
    strictEqual(Reference.resolve('karoli', "5Móz 35"), undefined);
    strictEqual(Reference.resolve('karoli', "Foo 1"),   undefined);
    strictEqual(Reference.resolve('karoli', "Je 1"),    undefined);
  });

}());
