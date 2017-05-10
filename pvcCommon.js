


var testdata = [
  {
    "name": "v5.1.3",
    "zipball_url": "https://api.github.com/repos/kurtmckee/feedparser/zipball/v5.1.3",
    "tarball_url": "https://api.github.com/repos/kurtmckee/feedparser/tarball/v5.1.3",
    "commit": {
      "sha": "4056bbbd314dde596d63a8e804b168088a177510",
      "url": "https://api.github.com/repos/kurtmckee/feedparser/commits/4056bbbd314dde596d63a8e804b168088a177510"
    }
  },
  {
    "name": "5.2.1",
    "zipball_url": "https://api.github.com/repos/kurtmckee/feedparser/zipball/5.2.1",
    "tarball_url": "https://api.github.com/repos/kurtmckee/feedparser/tarball/5.2.1",
    "commit": {
      "sha": "cf4185144c5ae012ada8203d0f33bcc57e4aeb6f",
      "url": "https://api.github.com/repos/kurtmckee/feedparser/commits/cf4185144c5ae012ada8203d0f33bcc57e4aeb6f"
    }
  },
  {
    "name": "5.2.0",
    "zipball_url": "https://api.github.com/repos/kurtmckee/feedparser/zipball/5.2.0",
    "tarball_url": "https://api.github.com/repos/kurtmckee/feedparser/tarball/5.2.0",
    "commit": {
      "sha": "b3d9280a8f6239811db544f6c835fc63218f04c4",
      "url": "https://api.github.com/repos/kurtmckee/feedparser/commits/b3d9280a8f6239811db544f6c835fc63218f04c4"
    }
  }
]

// From: http://stackoverflow.com/questions/15478954/sort-array-elements-string-with-numbers-natural-sort
naturalCompare = function (a, b) {
  var ax = [], bx = [];

  a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
  b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });

  while(ax.length && bx.length) {
    var an = ax.shift();
    var bn = bx.shift();
    var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
    if(nn) return nn;
  }

  return ax.length - bx.length;
}

// Test
function test (data) {
  console.log(data);
  console.log("Top name = " + data[0].name);
  var versions = [];
  for (var i=0;i<data.length;i++) {
    versions.push(data[i].name.replace(/^[^0-9]/, ""));
  }
  console.log("All names = " + versions);
  versions.sort( function(a,b) { return naturalCompare(b, a); });
  console.log("Sorted names = " + versions);
  console.log("Biggest = " + versions[0]);
}

//test(testdata);

/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

