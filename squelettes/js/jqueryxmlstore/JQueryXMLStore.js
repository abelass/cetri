	/*! 
		JQuery XML Store / Shop - Shopping Cart
		Created by LivelyWorks - http://livelyworks.net
		
	*/
	
	$(document).ready(function(){
	// Variables
	var logoImage = "",
		currencySymbol = "€",
		currency = "EUR",
		businessEmail = "frederic.leveque@icloud.com",
		UsePaypal = 1,
		UseSubmitOrder = 1,
		ShippingCharges = 3,
		cart_cookie_name = 'xml_jquery_store_'+window.location.hostname,
		productsArr=new Array(),
		productCart =  new Array(),
		cart_html = '',
		total_html = '',
		cart_item_ids = 1,
		products_container = '',
		allProductsData = '',
		productSubTotal = new Number(0),
		isOrderSubmitted = false,
		dateTime =new Date(),
		isOrderProcessing = false;
	
	// Load Config XML
	$.ajax({
		type: "GET",
		url: "/squelettes/xml/configData.html?file="+dateTime.getTime(),
		dataType: "html",
		success: function(configXML) {
		
		var configEl = $(configXML).find('configuration')[0];
		// logo image
		logoImage = $(configEl).attr('logoImage');
		// currency Symbol
		if($(configEl).attr('currencySymbol'))
		currencySymbol = $(configEl).attr('currencySymbol');
		// Currency
		if($(configEl).attr('currency'))
		currency = $(configEl).attr('currency');
		// Business Email
		if($(configEl).attr('businessEmail'))
		businessEmail = $(configEl).attr('businessEmail');
		// Chack if allows PayPal
		if($(configEl).attr('UsePaypal'))
		UsePaypal = parseInt($(configEl).attr('UsePaypal'));
		// Check if allows Submit Order
		if($(configEl).attr('UseSubmitOrder'))
		UseSubmitOrder = parseInt($(configEl).attr('UseSubmitOrder'));
		// Shipping Charges
		if($(configEl).attr('ShippingCharges'))
		ShippingCharges = parseFloat($(configEl).attr('ShippingCharges'));
		// Set logo
		$('#site_logo').attr('src', logoImage);
		// Disable PayPal Checkout button 
		if(UsePaypal == 0)
		$('#checkout_with_paypal').hide();
		// Disable Checkout button 
		if(UseSubmitOrder == 0)
		$('#checkout_submit_order').hide();
		// Update Cart
		updateCart();

	// Load products data xml
	$.ajax({
		type: "GET",
		url: "/squelettes/xml/productsData.html?file="+dateTime.getTime(),
		dataType: "html",
		success: function(productsXML) {
		
		var catCount = 1;
		var prodCount = 1;
		var currentRow = '';
		var calProductRows = 0;
				
				// Category
				$(productsXML).find('category').each(function(){
				var id = catCount;
				// Category Name
				var categoryName = $(this).attr('categoryName');
				//Set HTML for Category Name & Append to #categories_list
				$('<li></li>').html('<a href="#" class="cat_data_id_'+catCount+'">'+categoryName+'</a>').appendTo('#categories_list');
				// Product Items
				$('<div class="items" id="category_'+id+'"></div>').html('<a href="#"> <h2>'+catCount+": "+categoryName+'</h2></a>').appendTo('#products');
				// Each Product
				$(this).find('product').each(function(){
					// Product Name
					var productName = $(this).attr('productName');
					// Thumbnail Path
					var thumbPath = $(this).attr('thumbPath');
					// Product Price
					var productPrice = new Number($(this).attr('productPrice')).toFixed(2);
					// Product ID
					var productID = $(this).attr('productID');
					// Create Unique ID for later use
					var uProdID = catCount+"_"+prodCount;
					//Product Details
					var details = $(this).find('details').text();
					//Product Sizes 
					var sizes_html = '<label class="control-label" for="siz_'+uProdID+'">Sélectionnez la taille: </label> <select class="input-small" id="siz_'+uProdID+'">';
					$(this).find('size').each(function(){
						sizes_html += '<option>'+$(this).text()+'</option>';
					});
					sizes_html += '</select>';
					//Product Colors 
					var colors_html = '<label class="control-label" for="col_'+uProdID+'">&nbsp; Sélectionnez la couleur: </label> <select class="input-small" id="col_'+uProdID+'">';
					$(this).find('color').each(function(){
						colors_html += '<option>'+$(this).text()+'</option>';
					});
					colors_html += '</select>';
					
					//Product Details Modal Box
					var modalBox = '<div id="product_'+uProdID+'" class="product_details_modal modal hide fade"> <div class="modal-header"><a class="close" data-dismiss="modal" >&times;</a> <div class="caption"><h3 id="product_name_'+uProdID+'">'+productName+'</h3><h4><small> Categorie: <strong>'+categoryName+'</strong> Produit ID: <strong>'+productID+'</strong> </small><strong class="price_color"> &nbsp; Prix: '+currencySymbol+' '+productPrice+'</strong> </h4></div></div><div class="modal-body">'+details+'</div> <div class="modal-footer"><div></div><br /><div class="form-inline">'+sizes_html+colors_html+'<a href="#" class="btn" data-dismiss="modal" >Fermer</a><a href="#" id="btn_'+uProdID+'" class="btn btn-warning add_to_cart_btn">Ajouter au <i class="icon-shopping-cart icon-white"></i></a></div></div></div>';
					//Product Item
					$('<li class="span2 product_item" data-id="prod_data_id_'+uProdID+'" data-type="cat_data_id_'+catCount+'" id="product_item_'+uProdID+'"></li>').html('<div class="thumbnail"><div class="thumb_holder"><a data-toggle="modal" href="#product_'+uProdID+'" ><img src="'+thumbPath+'" alt="'+productName+'"/></a></div><div class="caption"><div class="product_sum"><h4>'+productName+'</h4><h3 class="price_color">'+currencySymbol+' '+productPrice+'</h3></div>'+modalBox+'<p><a class="btn btn-warning" data-toggle="modal" href="#product_'+uProdID+'" ><i class="icon-zoom-in icon-white"></i> Voir les détails</a></p></div></div>').appendTo('#products_container');
				// Product Array
				productsArr['btn_'+uProdID] = {
							productName: productName,
						   productPrice: productPrice,
						   uProductID: uProdID,
						   productID:productID
						 };
				//On add to Cart	 
				$('#btn_'+uProdID).live("click", addToCart);
				// On Product Mouse Over
				$('#product_item_'+uProdID).live('mouseover',
				  function () {
					$('#products_breadcrumb').html(categoryName + ' &raquo; '+ productName);
				  }
			);
			// On Product Mouse Out
			$('#product_item_'+uProdID).live('mouseout',
				  function () {
					$('#products_breadcrumb').html(categoryName);
				}
			);
				// On Size change check if already in cart		
				$('#siz_'+uProdID).live("change", function(){
					checkButton(uProdID);
				});
				// On Color change check if already in cart
				$('#col_'+uProdID).live("change", function(){
					checkButton(uProdID);
				});
				//Update product count
				prodCount++;
				// Check if already in cart
				checkButton(uProdID);
				});
				//Update Category count
				catCount++;
			});
			
			$('#shopping_cart_loader').hide();
			
			// Product Box height
			equalHeight($(".product_item .thumbnail"));
			// Assign Product Container for letter use
			products_container = $('#products_container');
		  // clone all items within products_container
			 allProductsData = products_container.clone();

			 installSearch();
		}
	});
	
	}});

	// get the action filter option item on page load
  var selectedCategory = $('#categories_list li.active_category a').attr('class');
  //On category click filter products
 	$('#categories_list li a').live('click', function(e) {

 	$('input#search_item').val('');

	//Update Breadcrumb
		$('#products_breadcrumb').html($(this).text());
		// Remove active_category class
		$('#categories_list li').removeClass('active_category');
		// get sellected category class
		var selectedCategory = $(this).attr('class');
		// Add active_category class
		$(this).parent().addClass('active_category');
		// If Clicked All categories
		if (selectedCategory == 'all') {
			var categoryProducts = allProductsData.find('li');
		} else {
			// data for the selected category
			var categoryProducts = allProductsData.find('li[data-type=' + selectedCategory + ']');
		}

		// Call Quicksand
		products_container.quicksand(categoryProducts, {
			duration: 400,
			easing: 'easeInOutQuad'
		},function(){
			updateCart();
			installSearch();
		});
		return false;
	});

	var current_products_count = $('#current_products_count');
	var searchInput = $('input#search_item');
	var clear_search = $('#clear_search');
	clear_search.hide();

	//Clear search result
	$('#clear_search').live('click', function(){
									$('input#search_item').val('');
									installSearch();
								});
	
//After searched
	function installSearch(){
//Search query
			$(searchInput).quicksearch('#products_container li',{
				'onBefore': function () {
        				$('#products_container').height(0);
			    },
			    'onAfter': function () {
			        	$('#products_container').height('auto');
			        	if(searchInput.val() != ""){
			        		var currentProductsCount = $('#products_container li:visible').length;
							current_products_count.html(currentProductsCount+' product(s) were found in '+$('.active_category').text()+' products.');
								clear_search.show();
						}else{
							current_products_count.html('');
							clear_search.hide();
						}
			    }
			});
	}
	
	// Retrive Cart Cookie to update cart
	var retriveArr = $.cookie(cart_cookie_name);
	if(retriveArr != null){
		productCart = $.parseJSON(retriveArr);
	}
	// Add to Cart
	function addToCart(){
					// Product Specs
					var prodId = $(this).attr('id');
					var onlyProdId = prodId.substring(4);
					var productName = productsArr[prodId].productName;
					var tempPPrice = productsArr[prodId].productPrice;
					var productID = productsArr[prodId].productID;
					var productSize = $('#siz_'+onlyProdId+' option:selected').val();
					var productColor = $('#col_'+onlyProdId+' option:selected').val();
					var prdQty = 1;
					//Check if the product already exist in Cart if exist update quantity
					for (var a in productCart) {
						if (productName == productCart[a].productName && productSize == productCart[a].productSize && productColor == productCart[a].productColor){
							prdQty = productCart[a].productQty++;
							updateCart();
							return false;
						}
					}
					// Product to cart Array
					productCart.push({
							productName: productName,
							productPrice: tempPPrice,
							productSize: productSize,
							productColor: productColor,
						    productQty: 1,
							uProductID: onlyProdId,
							productID:productID
						 });
					//update cart item id
					cart_item_ids++;
					//Update cart
					updateCart();
					//order is not submitted yet
					isOrderSubmitted = false;
					return false;
			}
	
	// Update Cart
	function updateCart(){
			cart_html = '';
			total_html = '';
			productSubTotal = 0;
			var total_items = 0
			//cart rows
			for(var i in productCart) {
				var value = productCart[i];
				// Sub Total
				productSubTotal = productSubTotal + (value.productPrice * value.productQty);
				cart_html += '<tr id="cart_row_'+i+'">';
				cart_html += '<td>'+value.productName+'</td>';
				cart_html += '<td>'+value.productSize+'</td>';
				cart_html += '<td>'+value.productColor+'</td>';
				cart_html += '<td>'+currencySymbol+' '+ value.productPrice+'</td>';				
				cart_html += '<td><input type="number" step="1" min="1" value="'+value.productQty+'" class="input-small span1 cart_product_qty"/></td>';
				cart_html += '<td>'+currencySymbol+' '+ (value.productPrice*value.productQty).toFixed(2)+'</td>';
				cart_html += '<td><a href="#" id="delete_prod_id'+i+'" class="close delete_product_from_cart" title="Delete">&times;</a></td>';
				cart_html += '</tr>';
				checkButton(value.uProductID);
				total_items += value.productQty;
			}
			
			// Saves cart for later use
			$.cookie(cart_cookie_name,$.toJSON(productCart));
			//Populate Shopping cart data
			$('#shopping_cart_data').html(cart_html);
			// Shipping charges
			var tempShippingCharges = productSubTotal>0 ? ShippingCharges : 0;
			//Shopping cart total etc
			total_html += 'Base Total: '+(productSubTotal).toFixed(2)+' + Shipping: '+currencySymbol+' '+ (tempShippingCharges).toFixed(2)+' = <strong>'+ currencySymbol+' '+ (productSubTotal+tempShippingCharges).toFixed(2) +' '+currency+'</strong>';
			//Populate Shopping cart total data
			$('#shopping_cart_total').html(total_html);
			//Update Show Cart Button
			$('#show_cartBtn').html(total_items+'</strong> Item(s) of <strong>'+currencySymbol+' '+(productSubTotal).toFixed(2)+' '+currency+' '+'</strong>in your <i class="icon-shopping-cart"></i><strong>');
			// Disable/Enable buttons as required
			if(productSubTotal <= 0){
				$('#checkout_with_paypal').addClass('disabled');
				$('#checkout_submit_order').addClass('disabled');
			}else{
				$('#checkout_with_paypal').removeClass('disabled');
				$('#checkout_submit_order').removeClass('disabled');
			}
			
			return false;
	}
	
	// Check Button
	function checkButton(tempProId){
		var onlyProdId = tempProId,
			buttonId = 'btn_'+onlyProdId,
			productName = $('#product_name_'+onlyProdId).text(),
			productSize = $('#siz_'+onlyProdId+' option:selected').val(),
			productColor = $('#col_'+onlyProdId+' option:selected').val();
		// Check item in cart
			for (var a in productCart) {
				if (productName == productCart[a].productName && productSize == productCart[a].productSize && productColor == productCart[a].productColor){
					$('#btn_'+productCart[a].uProductID).html('Update <i class="icon-shopping-cart icon-white"></i>: '+productCart[a].productQty);
							return false;
						}
					}
					// update add to cart button text
					$('#btn_'+onlyProdId).html('Add to <i class="icon-shopping-cart icon-white"></i>');
					
					return false;
	}
	
	//	on remove item from cart
	$('.delete_product_from_cart').live("click", delete_product_from_cart);
	//on change quantity
	$('.cart_product_qty').live("change", cart_change_qty);
	
	// Change quantity
	function cart_change_qty(){
		var cartrow_id = $(this).parent().parent().attr('id'),
			prodId = cartrow_id.substring(9);
		// No need of alphabetical character neither 0 
		if($(this).val() <= 0 || !Number($(this).val())){
			$(this).val(1);
		}
		// update quantity
		productCart[prodId].productQty = Math.round($(this).val());
		// Update Cart
		updateCart();		
		return false;
	}
	
	//remove item from cart
	function delete_product_from_cart(){
		var prodId = $(this).attr('id');
		var onlyProdId = prodId.substring(14);
		//Update text on product add to cart
		$('#btn_'+productCart[onlyProdId].uProductID).html('Add to <i class="icon-shopping-cart icon-white"></i>');
		//Remove item from Cart Array
		productCart.splice(onlyProdId,1);
		// Update Cart
		updateCart();		
		return false;
	}
	
	// On PayPal CheckOut Click
	$('#checkout_with_paypal').live("click", paypalCheckOut);
	// On Submit Order CheckOut Click
	$('#checkout_submit_order').live("click", function(){
		if(productSubTotal <= 0){
			return false;
		}
		// Show Submit Order Form
		$('#submit_order_form_holder').modal('show');
	});
	// on Order submit click
	$('#submit_order_btn').live("click", checkoutSubmitOrder);
	
	// Validate Email
	$('#sof_email').live("change", function(){
		validateEmail();
	});
	
	// Validate Email
	function validateEmail(){
		var $email = $('#sof_email').val();
		if($email == ''){
			return false;
		}
		var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
		if( !emailReg.test( $email ) ) {
			$('#submit_order_btn').addClass('disabled');
			return false;
		} else {
			$('#submit_order_btn').removeClass('disabled');
			return true;
		}
	}
	// On Order Status 
	$('#order_submit_status').on('hidden', function () {
		isOrderSubmitted = false;
	});
	

	// On Submit Order holder hide show cart if order not submitted
	$('#submit_order_form_holder').on('hidden', function () {
		
		if(isOrderSubmitted == false){
			$('#cart_holder').modal('show');
		}
	});
	// On Submit Order holder show hide cart if order not submitted
	$('#submit_order_form_holder').on('show', function () {
	  $('#cart_holder').modal('hide');
	});
	
	// PayPal Check Out
	function paypalCheckOut(){
	
	if(productSubTotal <= 0){
		return false;
	}
	
	var paypalUrl = 'https://www.paypal.com/cgi-bin/webscr?cmd=_cart&upload=1&charset=utf-8&currency_code='+currency+'&business='+businessEmail+'&handling_cart='+ShippingCharges;
	
	var itemsCartIndex = 1;
	// Get Products for order
		for (var a in productCart) {
			paypalUrl += '&item_name_'+itemsCartIndex+'='+productCart[a].productName +' Size: '+productCart[a].productSize+' Color: '+productCart[a].productColor;
			paypalUrl += '&item_number_'+itemsCartIndex+'='+productCart[a].productID;
			paypalUrl += '&amount_'+itemsCartIndex+'='+productCart[a].productPrice;
			paypalUrl += '&quantity_'+itemsCartIndex+'='+productCart[a].productQty;
			itemsCartIndex++;
		}
		// get url to make payment
		window.open(paypalUrl);
		return false;
		
	}
	

	// Submit Order Checkout
	function checkoutSubmitOrder(){
	//If total 0
	if(productSubTotal <= 0 ){
		return false;
	}
	//If email on Validate
	if(validateEmail() == false){
		return false;
	}
	
	//If email on Validate
	if(isOrderProcessing == true){
		return false;
	}
	
	isOrderProcessing = true;
	
	$('#submit_order_btn').addClass('disabled');
	$('#submit_order_btn').text('Processing...');

	var cartMailer = 'squelettes/php/jqueryxmlstore/cartMailer.php?currency_code='+currency+'&business='+businessEmail+'&value=USD&handling_cart='+ShippingCharges;
	
	var itemsCartIndex = 1;
	
		for (var a in productCart) {
		// Get Products for order
			cartMailer += '&item_name_'+itemsCartIndex+'='+productCart[a].productName +' Size: '+productCart[a].productSize+' Color: '+productCart[a].productColor;
			cartMailer += '&item_number_'+itemsCartIndex+'='+productCart[a].productID;
			cartMailer += '&amount_'+itemsCartIndex+'='+productCart[a].productPrice;
			cartMailer += '&quantity_'+itemsCartIndex+'='+productCart[a].productQty;
			itemsCartIndex++;
		}
		//Get Form Data
		var formData = $('#submit_order_form').serialize();
		 cartMailer += '&cartLength='+itemsCartIndex+'&'+formData;
		 // Post Data
		 $.post(cartMailer, function(data) {
		 
		 isOrderSubmitted = true;
			 
		 // Check if order email sent
		 if(data != 'mailSentSuccess=1'){
			
		 // If not Show Error Message
			$('#order_status_text').html('La commande a échoué. Faites un autre essai!!');
			$('#submit_order_form_holder').modal('hide');
			$('#order_submit_status').modal('show');
		//	isOrderSubmitted = false;
			
		 }else{
				// If Yes!! Show Success Message
				$('#order_status_text').html('Votre commande a été envoyée');
				$('#submit_order_form_holder').modal('hide');
				$('#order_submit_status').modal('show');
				for (var a in productCart) {
					$('#btn_'+productCart[a].uProductID).html('Ajoutez à <i class="icon-shopping-cart icon-white"></i>');
				}
				// Empty Cart Array
				productCart = [];
				//Update Cart
				updateCart();
			}
			
		 isOrderProcessing = false;
		 $('#submit_order_btn').removeClass('disabled');
		 $('#submit_order_btn').text('Submit Order');
		
		});
		
		 return false;
	}
	
	//Go to Top
	$("a.topLink").click(function() {
		$("html, body").animate({
			scrollTop: "0px"
		}, {
			duration: 600,
			easing: "swing"
		});
		return false;
	});
	
	// Equal Height for all the products
	function equalHeight(group) {
	   tallest = 0;
	   group.each(function() {
		  thisHeight = $(this).height();
		  if(thisHeight > tallest) {
			 tallest = thisHeight;
		  }
	   });
	   
	   if(tallest < 220){	   
		group.height(220);
	   }else{
		group.height(tallest);
	   }
	}
	//Update Cart
	updateCart();
});