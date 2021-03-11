const apiEndPoint = "https://api.punkapi.com/v2/beers?per_page=51";
const perPage = 51;
var currentSearch;
var currentPage;
var allLoaded = false;
var favs = [];

$(document).ready(function() {
    clearBeers();

    if(Cookies.get('favbeers') != undefined){
        favs = JSON.parse( Cookies.get('favbeers'));
        if(favs.includes(null)){
            favs = removeItemAll(favs,null);
            Cookies.set('favbeers',JSON.stringify(favs));
        }
    }
    
    currentSearch = apiEndPoint;
    currentPage = 1;
    
    $.ajax({
        url: apiEndPoint
    }).then(function(data) {
        updateBeers(data)
     }); 
});

$(document).on('click', '.item-readdesc', function () {
    var itemId =  $(this).parent().attr('item-id');
    if($(this).hasClass("descopen")){
        $(this).removeClass("descopen");
        $(this).parent().siblings(".item-description").removeClass("showdesc");
    } else {
        $(this).addClass("descopen");
        $(this).parent().siblings(".item-description").addClass("showdesc");
    }
});

$(document).on('click', '.item-fav', function () {
    var itemId =  $(this).parent().parent().attr('item-id');
    if($(this).hasClass("fav")){
        favs = removeItemOnce(favs, itemId);
        $(this).removeClass("fav");
    } else {
        favs.push(itemId);
        $(this).addClass("fav");
    }
    Cookies.set("favbeers",JSON.stringify(favs));
});

$(window).scroll(function() {
    if(!allLoaded){
        if($(window).scrollTop() + $(window).height() == $(document).height()) {
            loadNextPage();
        }
    }
 });

 function searchFavs(){
    searchBeers(true);
 }

 function clearSearch(){
    clearBeers();

    $('#beernamesearch').val("");
    $('#beerfoodsearch').val("");
    $("input[name='abvradio']").filter('[value=0]').prop('checked',true);

    currentSearch = apiEndPoint;
    currentPage = 1;
    
    $.ajax({
        url: apiEndPoint
    }).then(function(data) {
        updateBeers(data)
     }); 
 }

function searchBeers(favsearch = false){
    clearBeers();
    currentPage = 1;
    allLoaded = false;
    currentSearch = apiEndPoint;

    beerNameSearchVal = $('#beernamesearch').val().replace(" ", "_");
    beerFoodSearchVal = $('#beerfoodsearch').val().replace(" ", "_");
    abvSearchVal = $("input[name='abvradio']:checked").val();

    if(favsearch){
        currentSearch+= "&ids="+favs.join("|");
    }

    if (beerNameSearchVal != ""){
        currentSearch += "&beer_name="+ beerNameSearchVal;
    }

    if (beerFoodSearchVal != ""){
        currentSearch += "&food="+ beerFoodSearchVal;
    }

    switch (abvSearchVal) {
        case "1":
            currentSearch += "&abv_lt=4.5";
            break;

        case "2":
            currentSearch += "&abv_gt=4.5&abv_lt=7.5";
            break;

        case "3":
            currentSearch += "&abv_gt=7.5";
            break;
    
        default:
            break;
    }

    $.ajax({
        url: currentSearch
    }).then(function(data) {
        if(data.length < perPage){
            allLoaded = true;
        }
        updateBeers(data)
     });
}


function updateBeers(data){
    var result = "";
    var beerTemplate = '<div class="col-lg-4 col-sm-12"><div class="item" item-id="%%id%%"><div class="item-name"><span>%%name%%</span></div><div class="item-tagline"><i>%%tagline%%</i></div><div class="item-pic"><img src="%%imgurl%%"></div><div class="item-abv"><span>%%abv%%</span></div><div class="btngroupright"><div class="item-fav %%faved%%"> <i class="fas fa-star"></i></div><div class="item-readdesc"><i class="fab fa-readme"></i></div></div><div class="item-description"><p>%%desc%%</p><p>%%food%%</p></div></div></div>';
   
    for (var i in data){
        var item = beerTemplate.replace("%%name%%",data[i].name);
        if (data[i].image_url == null){
            item = item.replace("%%imgurl%%","");
        } else {
            item = item.replace("%%imgurl%%",data[i].image_url);
        }
        
        item = item.replace("%%tagline%%",data[i].tagline);
        item = item.replace("%%abv%%",data[i].abv+"%");
        item = item.replace("%%id%%",data[i].id);
        item = item.replace("%%desc%%", "<b>Description: </b>" + data[i].description);

        item = item.replace("%%food%%", "<b>Food pairings:</b> " + String(data[i].food_pairing).replace(/,/g, ", "));

        if (favs.includes(String(data[i].id))){
            item = item.replace("%%faved%%","fav")
        } else {
            item = item.replace("%%faved%%","")
        }
        result += item;
    }

    $('#beers').append(result);
}


function loadNextPage(){

    currentPage++;

    $.ajax({
        url: currentSearch+"&page="+currentPage
    }).then(function(data) {
        updateBeers(data)
     });
}


function clearBeers(){
    $('#beers').html('');
}

function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }

  function removeItemAll(arr, value) {
    var i = 0;
    while (i < arr.length) {
      if (arr[i] === value) {
        arr.splice(i, 1);
      } else {
        ++i;
      }
    }
    return arr;
  }