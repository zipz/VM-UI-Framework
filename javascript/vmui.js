/**
* @author Virtuosi Media
* @link http://www.virtuosimedia.com
* @version 1.0
* @copyright Copyright (c) 2012, Virtuosi Media
* @license: MIT License
* @description: Dynamically loads VMUI scripts based on need
* Requirements: MooTools 1.4 Core - See http://mootools.net
*/
var VMUI = new Class({
	Implements: [Events, Options],

	options: {
		assets: [
		         {name:'Accordion', source:'navigation/accordion.js', selectors:'.accordion'},
		         {name:'Button', source:'widgets/button.js', selectors:'.button[data-state], [class*=Button][data-state]'},
		         {name:'CheckboxReplace', source:'form/replace/checkbox.js', selectors:'input[type=checkbox]'},
		         {name:'RadioReplace', source:'form/replace/radio.js', selectors:'input[type=radio]'},
		         {name:'SelectReplace', source:'form/replace/select.js', selectors:'select:not([multiple])'},
		         {name:'Dropdown', source:'navigation/dropdown.js', selectors:'.dropdown, .megaDropdown'},
		         {name:'Lighter', source:'lighter/lighter.js', selectors:'pre'},
		         {name:'Modal', source:'layout/modal.js', selectors:'.modalTrigger'},
		         {name:'Notice', source:'layout/notice.js', selectors:'div.notice, div[class*="Notice"]'},
		         {name:'Carousel', source:'layout/carousel.js', selectors:'.carousel, .carouselClean, .carouselVertical'},
		         {name:'Social', source:'widgets/social.js', selectors:'.socialShare'},
		         {name:'Tabs', source:'navigation/tabs.js', selectors:'.tabs, .tabsVertical, .pillTabs, .pillTabsVertical'},
		         {name:'Tips', source:'widgets/tips.js', selectors:'[class*=tip], [class*=powertip]'},
		         {
		        	 name:'Charts', 
		        	 source:'data/charts.js', 
		        	 selectors:'.lineChart, .inlineLineChart, .scatterChart, .areaChart, .inlineAreaChart, .barChart, .inlineBarChart, .columnChart, .inlineColumnChart, .pieChart, .inlinePieChart'
		         },
		         {name:'Pin', source:'layout/pin.js', selectors:'.pin'},
		         {name:'Validate', source:'form/validate.js', selectors:'form'},
		         {name:'PasswordToggle', source:'form/password/toggle.js', selectors:'input[type=password].toggle'},
		         {name:'PasswordMeter', source:'form/password/meter.js', selectors:'input.meter'},
		         {name:'Sliders', source:'form/widget/sliders.js', selectors:'input.slider'},
		         {name:'Autocomplete', source:'form/widget/autocomplete.js', selectors:'input.autocomplete'},
		         {name:'Pager', source:'layout/pager.js', selectors:'.pager'},
		         {name:'MobileMenu', source:'navigation/mobilemenu.js', selectors:'.mobileMenu'},
		         {name:'Reveal', source:'widgets/reveal.js', selectors:'.revealToggle'},
		         {
		        	 name:'Baseline', 
		        	 source:'layout/baseline.js', 
		        	 selectors:'img:not(.skipBaseline), svg:not(.skipBaseline), canvas:not(.skipBaseline), object:not(.skipBaseline), video:not(.skipBaseline), audio:not(.skipBaseline), iframe:not(.skipBaseline), [class*=Chart]:not(.skipBaseline)'
		         } //This should always go last to let everything render
		],
		relativePath: '../javascript'		
	},

	/**
	 * @param object - options - The options object
	 */
	initialize: function(options){
		this.setOptions(options);
		var self = this;
		$(document.body).addEvent('ajaxUpdate', function(parent){self.loadScripts(parent);});
		var smoothScroll = new Fx.SmoothScroll({links: 'a:not(.revealToggle):not(.tabs):not([class*=Tabs]):not([class*=tip]):not)[class*=powertip])'});
		this.loadScripts(document.body);		
	},	
	
	loadScripts: function(parent){
		var self = this;
		Array.each(this.options.assets, function(script){
			if (parent.getElements(script.selectors).length){
				if (self.checkExists(script.name)){
					Asset.javascript(self.options.relativePath+'/'+script.source, {
						 onLoad: function(){
							 if (script.name == 'Lighter'){
								self.loadLighter(parent.getElements(script.selectors));
							 } else {
								 var plugin = new window[script.name](parent.getElements(script.selectors));
							 }
						 }
					 });
				} else {
					 var plugin = new window[script.name](parent.getElements(script.selectors));
				}
			}
		});
	},

	checkExists: function(name){
		return (typeof name !== 'undefined');
	},

	loadLighter: function(selectors){
		var self = this;
		var assets = [
		     'lighter/loader.js', 'lighter/parser.js', 'lighter/parser/smart.js',
		     'lighter/compiler.js', 'lighter/compiler/list.js', 'lighter/compiler/inline.js', 'lighter/fuel.js',
		     'lighter/wick.js',
		];
		self.loadLighterAsset(assets, 0, selectors);
	},	
	
	/**
	 * This method forces the lighter assets to load sequentially, avoiding the occasional loading error
	 */
	loadLighterAsset: function(assets, index, selectors){
		var self = this;
		var last = assets.length;
		if (index != last){		
			if (self.checkExists(assets[index])){
				Asset.javascript(self.options.relativePath+'/'+assets[index], {
					onLoad: function(){
						index++;
						self.loadLighterAsset(assets, index, selectors);
					}
				});
			} else {
				index++;
				self.loadLighterAsset(assets, index, selectors);				
			}
		} else {
			this.igniteLighter(selectors);
		}
	},

	igniteLighter: function(selectors){
		var lighter = new Lighter({
			loader:   new Loader({}),
			parser:   new Parser.Smart({ strict: true }),
			compiler: new Compiler.List(),
			mode: 'ol'
		});

		$$(selectors).each(function(el) {
			lighter.light(el);
			
			//This fixes a bug in IE that creates duplicate codeblocks
			if (Browser.ie){
				var fixIEBug = function(){
					el.getNext().dispose();
				};
				fixIEBug.delay(500)
			}
		});	
	}
});