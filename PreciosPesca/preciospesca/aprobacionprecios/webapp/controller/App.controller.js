sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    'sap/m/MessageBox',
	"sap/ui/core/util/ExportTypeCSV",
    "sap/ui/core/util/Export",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	 function (BaseController,Controller,JSONModel,History,MessageBox,ExportTypeCSV,Export,Filter,FilterOperator) {
		"use strict";
		const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'
		var JsonFechaIni={
			fechaIni:"",
			fechaIni2:""
		};
		var popEmb="";
		var oGlobalBusyDialog = new sap.m.BusyDialog();
		var popUp="";
		return BaseController.extend("tasa.com.aprobacionprecios.controller.App", {
			onInit: function () {
				let ViewModel= new JSONModel(
					{}
					);
					var oGlobalBusyDialog = new sap.m.BusyDialog();
					this.setModel(ViewModel,"litoral");
					this.setModel(ViewModel,"precio");
					this.setModel(ViewModel,"reporteCala")
					this.byId("idTipoPrecio").setValue("COMPRA");
					this.listPlanta();
					this.loadIndicadorP();
					this.byId("idAciertos").setValue("200");
			},
			loadIndicadorP: function(){
				oGlobalBusyDialog.open();
				var ZINPRP=null;
				var body={
					"dominios": [
					  {
						"domname": "ZINPRP",
						"status": "A"
					  }
					]
				}
				fetch(`${mainUrlServices}dominios/Listar/`,
					  {
						  method: 'POST',
						  body: JSON.stringify(body)
					  })
					  .then(resp => resp.json()).then(data => {
						console.log(data);
							
						ZINPRP= data.data.find(d => d.dominio == "ZINPRP").data;
							
							this.getModel("Propiedad").setProperty("/listaPropiedad", ZINPRP);
							oGlobalBusyDialog.close();
					  }).catch(error => console.log(error)
				);

			},
			listaEmbarcacion: function(){
				oGlobalBusyDialog.open();
				console.log("BusquedaEmbarca");
				var idEmbarcacion =sap.ui.getCore().byId("idEmbarcacion").getValue();
				var idEmbarcacionDesc =sap.ui.getCore().byId("idEmbarcacionDesc").getValue();
				var idMatricula =sap.ui.getCore().byId("idMatricula").getValue();
				var idRuc =sap.ui.getCore().byId("idRuc").getValue();
				var idArmador =sap.ui.getCore().byId("idArmador").getValue();
				var idPropiedad = sap.ui.getCore().byId("idPropiedad").getSelectedKey();

				var options=[];
				var options2=[];
				options.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "ESEMB",
					"valueHigh": "",
					"valueLow": "O"
				})
				if(idEmbarcacion){
					options.push({
						"cantidad": "20",
						"control": "COMBOBOX",
						"key": "CDEMB",
						"valueHigh": "",
						"valueLow": idEmbarcacion
						
					});
				}
				if(idEmbarcacionDesc){
					options.push({
						"cantidad": "20",
						"control": "COMBOBOX",
						"key": "NMEMB",
						"valueHigh": "",
						"valueLow": idEmbarcacionDesc
						
					});
				}
				if(idMatricula){
					options.push({
						"cantidad": "20",
						"control": "COMBOBOX",
						"key": "MREMB",
						"valueHigh": "",
						"valueLow": idMatricula
					})
				}
				if(idPropiedad){
					options.push({
						"cantidad": "20",
						"control": "COMBOBOX",
						"key": "INPRP",
						"valueHigh": "",
						"valueLow": idPropiedad
					})
				}
				if(idRuc){
					options2.push({
						"cantidad": "20",
						"control": "COMBOBOX",
						"key": "STCD1",
						"valueHigh": "",
						"valueLow": idRuc
					})
				}
				if(idArmador){
					options2.push({
						"cantidad": "20",
						"control": "COMBOBOX",
						"key": "NAME1",
						"valueHigh": "",
						"valueLow": idArmador
					})
				}
				
				var body={
					"option": [
					  
					],
					"option2": [
					  
					],
					"options": options,
					"options2": options2,
					"p_user": "BUSQEMB"
				  }
				  console.log(body);
				fetch(`${mainUrlServices}embarcacion/ConsultarEmbarcacion/`,
					  {
						  method: 'POST',
						  body: JSON.stringify(body)
					  })
					  .then(resp => resp.json()).then(data => {
						  console.log(data);
						var dataPuerto=data.data;
						console.log(dataPuerto);
						console.log(this.getView().getModel("Embarcacion").setProperty("/listaEmbarcacion",dataPuerto));
						
							sap.ui.getCore().byId("titleEmbarca").setText("Lista de registros: "+dataPuerto.length);
						if(dataPuerto.length<=0){
							sap.ui.getCore().byId("titleEmbarca").setText("Lista de registros: No se encontraron resultados");
						}
						oGlobalBusyDialog.close();
					  }).catch(error => console.log(error)
				);
			},
			buscarFecha: function(oEvent){
			   
			 var dateIni= new Date(oEvent.mParameters.from);
			 var dateIni2 = new Date(oEvent.mParameters.to);
			 if(oEvent.mParameters.from==null){
				 dateIni="";	
			 }
			 if(oEvent.mParameters.to==null){
				 dateIni2="";	
			 }
			 var id=oEvent.mParameters.id;
			 var fechaIni="";
			 var fechaIni2="";
			 if(dateIni){
				  fechaIni=this.generateFecha(dateIni);
			 }
			 if(dateIni2){
				  fechaIni2=this.generateFecha(dateIni2);
			 }
 
			 
			 if(id==="application-aprobacionprecios-display-component---App--idFechaIniVigencia")
			 {
				 JsonFechaIni={
					 fechaIni:fechaIni,
					 fechaIni2:fechaIni2
				 }
			 }	 
		 },
		 generateFecha: function(date){
		   var day=date.getDate();
		   var anio=date.getFullYear();
		   var mes=date.getMonth()+1;
		   if(mes<10){
			   mes=this.zeroFill(mes,2);
		   }
		   if(day<10){
			   day=this.zeroFill(day,2);
		   }
		   var fecha= anio.toString()+mes.toString()+day.toString();
		  
		  
		   return fecha;
	   },
	   listaArmador: function(){
		oGlobalBusyDialog.open();
		var idAciertos = 	sap.ui.getCore().byId("idAciertosPop").getValue().trim();
		var idRuc = 	sap.ui.getCore().byId("idRuc2").getValue().trim();
		var idDescripcion = 	sap.ui.getCore().byId("idDescripcion").getValue().trim();
		var idCuentaProveedor =	sap.ui.getCore().byId("idCuentaProveedor").getValue().trim();
		
		console.log(idAciertos);
		console.log(idRuc);
		console.log(idDescripcion);
		console.log(idCuentaProveedor);
		var body={
			"delimitador": "|",
			"fields": [
			  
			],
			"no_data": "",
			"option": [
			 
			],
			"options": [
				{
					"cantidad": "10",
					"control": "INPUT",
					"key": "LIFNR",
					"valueHigh": "",
					"valueLow": idCuentaProveedor,
				  },
				  {
					"cantidad": "10",
					"control": "INPUT",
					"key": "NAME1",
					"valueHigh": "",
					"valueLow": idDescripcion,
				  },
				  {
					"cantidad": "10",
					"control": "INPUT",
					"key": "STCD1",
					"valueHigh": "",
					"valueLow": idRuc,
				  }
			  
			],
			"order": "",
			"p_user": "FGARCIA",
			"rowcount": idAciertos,
			"rowskips": 0,
			"tabla": "LFA1"
		  }
		  fetch(`${mainUrlServices}General/Read_table/`,
			  {
				  method: 'POST',
				  body: JSON.stringify(body)
			  })
			  .then(resp => resp.json()).then(data => {
				var dataPuerto=data.data;
				console.log(dataPuerto);
				console.log(this.getView().getModel("Armador").setProperty("/listaArmador",dataPuerto));
				sap.ui.getCore().byId("idListaArmador").setText("Lista de registros: "+dataPuerto.length);
				if(dataPuerto.length<=0){
					sap.ui.getCore().byId("idListaArmador").setText("Lista de registros: No se encontraron resultados");
				}
				oGlobalBusyDialog.close();
			  }).catch(function(error){
					if(error){
						MessageBox.error(error.message);
						oGlobalBusyDialog.close();
					}
			  });
	},
			listPlanta: function(){
				var dataPlantas={
					"delimitador": "|",
					"fields": [
					 
					],
					"no_data": "",
					"option": [
					  {
						"wa":"INPRP = 'P'"
						},
						{
						"wa":"AND ESREG = 'S'"
						}
					],
					"options": [
					  
					],
					"order": "",
					"p_user": "FGARCIA",
					"rowcount": 0,
					"rowskips": 0,
					"tabla": "ZV_FLPL"
				  }
				  fetch(`${mainUrlServices}General/Read_Table`,
				  {
					  method: 'POST',
					  body: JSON.stringify(dataPlantas)
				  })
				  .then(resp => resp.json()).then(data => {
					var dataPuerto=data.data;
					
					console.log(this.getView().getModel("Planta").setProperty("/listaPlanta",dataPuerto));
				  }).catch(error => console.log(error)
				  );
				
			},

			goBackMain: function () {
				   this.getRouter().navTo("RouteApp");
				   location.reload();
		   },
		   EditarRow: function(){
			   var indices = this.byId("table").getSelectedIndices();
			  console.log(indices.length);
			  if(indices.length<=0){
			   MessageBox.error("Debe seleccionar almenos un elemento de la lista");
		   }else{
			   var cadena ="";
			   for(var i=0;i<indices.length;i++){
				   cadena += indices[i]+",";
			   }
			   var cadena=cadena.substring(0,cadena.length-1)
			   console.log(cadena);
				this.getRouter().navTo("EditarAprobacionPrecios",{cadena});
		   }
			   
		   },
		   loadTablaAprobacionPrecios: function(){
			oGlobalBusyDialog.open();   
			let options=[];
			   
			   var idPlantaIni=this.byId("idPlantaIni").getValue();
			   var idPlantaFin = this.byId("idPlantaFin").getValue();
			   var idArmadorIni = this.byId("idArmadorIni").getValue();
			   var idArmadorFin = this.byId("idArmadorFin").getValue();
			   var idEmbarcacionIni = this.byId("idEmbarcacionIni").getValue();
			   var idEmbarcacionFin = this.byId("idEmbarcacionFin").getValue();
			   var idAciertos = this.byId("idAciertos").getValue();
			   
			
			   var fechaIni=this.byId("idFechaIniVigencia").getValue();
			   
			   var error=""
			   var estado=true;
			   if(!fechaIni){
				error="Debe ingresar una fecha de inicio de vigencia\n";
				estado=false;
			   }
			   if(!estado){
				   MessageBox.error(error);
				   oGlobalBusyDialog.close()
				   return false;
			   }
			   var feccc =[];
			   feccc= fechaIni.trim().split("-");
			   for(var i=0;i<feccc.length;i++){
				   feccc[i]=feccc[i].trim();
			   }
			   var fechaIniVigencia= this.castFechas(feccc[0]);
			   var fechaIniVigencia2= this.castFechas(feccc[1]);
			   console.log(fechaIniVigencia+" "+fechaIniVigencia2);



			   
			   if(idPlantaIni || idPlantaFin){
					   options.push({
						   cantidad: "10",
						   control:"MULTIINPUT",
						   key:"WERKS",
						   valueHigh: idPlantaFin,
						   valueLow:idPlantaIni
					   });
			   }
			   if(idArmadorIni || idArmadorFin){
					   options.push({
						   cantidad: "10",
						   control:"MULTIINPUT",
						   key:"CDEMP",
						   valueHigh: idArmadorFin,
						   valueLow:idArmadorIni
					   });
			   }
			   if(idEmbarcacionIni || idEmbarcacionFin){
					   options.push({
						   cantidad: "10",
						   control:"MULTIINPUT",
						   key:"CDEMB",
						   valueHigh: idEmbarcacionFin,
						   valueLow:idEmbarcacionIni
					   });
			   }
			   if(fechaIni){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"FECCONMOV",
						valueHigh: fechaIniVigencia2,
						valueLow:fechaIniVigencia
					});
				}
			   if(idAciertos){
				   idAciertos=idAciertos;
			   }else{
				   idAciertos=200;
			   }
			   // if(idEstado ){
			   //         options.push({
			   //             cantidad: "10",
			   //             control:"MULTIINPUT",
			   //             key:"CDEMB",
			   //             valueHigh: idFechaFin,
			   //             valueLow:idFechaIni
			   //         });
			   // }
   
				 let body = {
				   "p_calidad": "",
				   "p_flag": "",
				   "p_indpr": "C",
				   
				   "p_option": [
					 {
					   wa: "(ESPRC EQ 'N' AND (ESCSG EQ 'L' OR ESCSG EQ '' OR ESCSG EQ ' ' OR ESCSG IS NULL)) AND PRCOM > '0.00'"
					 }
				   ],
				   "p_options": options,
				   "p_rows": idAciertos,
				   "p_user": "FGARCIA"
				   }
				   var indice=-1;
				  fetch(`${mainUrlServices}preciospesca/ConsultarPrecioMar`,
					   {
						   method: 'POST',
						   body: JSON.stringify(body)
					   })
					   .then(resp => resp.json()).then(data => {
							console.log(data);
							var dataPrecio = data;
						   for(var valor in data.str_pm){
							   if(data.str_pm[valor].NRMAR){
								   data.str_pm[valor].NRMAR= this.zeroFill(data.str_pm[valor].NRMAR,10);
								   for(var i=0;i<data.str_pm.length;i++){
									data.str_pm[i].PRCMX = parseFloat(data.str_pm[i].PRCMX).toFixed(2);
									data.str_pm[i].PRCOM = parseFloat(data.str_pm[i].PRCOM).toFixed(2);
									data.str_pm[i].PRCTP = parseFloat(data.str_pm[i].PRCTP).toFixed(2);
									data.str_pm[i].PCSPP = parseFloat(data.str_pm[i].PCSPP).toFixed(2);
									data.str_pm[i].PCCSG = parseFloat(data.str_pm[i].PCCSG).toFixed(2);
									if(data.str_pm[i].WAERS=="USD"){
										data.str_pm[i].WAERSDESC="- DOLARES AMERICANOS"
									}
									if(data.str_pm[i].ESPRC==="L"){
										data.str_pm[i].ESPRCDESC="Liberado";
									}else if(data.str_pm[i].ESPRC==="N"){
										data.str_pm[i].ESPRCDESC="No Liberado";
									}
									if(data.str_pm[i].ESCSG==="L"){
										data.str_pm[i].ESCSGDESC="Liberado";
									}else if(data.str_pm[i].ESCSG==="N"){
										data.str_pm[i].ESCSGDESC="No Liberado";
									}
									}
								   //this.getModel("reporteCala").setProperty("/items", data.str_pm)
								   
							   }
						   }
						   
							   this.byId("title").setText("Lista de registros: "+data.str_pm.length);
							   this.getView().getModel("AprobacionPrecio").setProperty("/listaAprobacionPrecio",dataPrecio.str_pm);
							  if(data.str_pm.length<=0){
								this.byId("title").setText("Lista de registros: No se encontraron resultados");
							  }
						   
						   oGlobalBusyDialog.close();
					   }).catch(error => console.log(error)
					   );
		   },
   
		   zeroFill: function( number, width )
		   {
			   width -= number.toString().length;
			   if ( width > 0 )
			   {
				   return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
			   }
			   return number + ""; // siempre devuelve tipo cadena
		   },
		   limpiarFiltros: function(){
				this.byId("idPlantaIni").setValue("");
				this.byId("idPlantaFin").setValue("");
				this.byId("idArmadorIni").setValue("");
				this.byId("idArmadorFin").setValue("");
				this.byId("idEmbarcacionIni").setValue("");
				this.byId("idEmbarcacionFin").setValue("");
				this.byId("idFechaIniVigencia").setValue("");
		   },
		   onDataExport:  function() {
			   var oExport = new Export({
				   exportType: new ExportTypeCSV({ // required from "sap/ui/core/util/ExportTypeCSV"
					 separatorChar: ";",
					 charset: "utf-8"
				   }),
				   //PoliticaPrecio>/listaPolitica
				   models: this.getView().getModel("AprobacionPrecio"),
				   rows:{path:""},
				   rows: { path: "/listaAprobacionPrecio" },
				   columns: [
					 {
					   name: "Marea",
					   template: {
						 content: "{NRMAR}"
					   }
					 },
					 {
					   name: "Nro descarga",
					   template: {
						 content: "{NRDES}"
					   }
					 },
					 {
					   name: "Planta",
					   template: {
						 content: "{DESCR}"
					   }
					 },
					 {
					   name: "Fecha inic. desc",
					   template: {
						 content: "{FIDES}"
					   }
					 },
					 
					 {
					   name: "Hora inic. desc",
					   template: {
						 content: "{HIDES}"
					   }
					 },
					 {
					   name: "Fecha fin desc.",
					   template: {
						 content: "{FFDES}"
					   }
					 },
					 {
					   name: "Hora fin desc.",
					   template: {
						 content: "{HFDES}"
					   }
					 },
					 {
					   name: "Cantidad desc.(Tn)",
					   template: {
						 content: "{CNPDS}"
					   }
					 },
					 {
					   name: "Fecha prod.",
					   template: {
						 content: "{FECCONMOV}"
					   }
					 },
					 {
					   name: "Embarcación",
					   template: {
						 content: "{NMEMB}"
					   }
					 },
					 {
					   name: "Armador comercial",
					   template: {
						 content: "{NAME1}"
					   }
					 },
					 {
					   name: "Pactado",
					   template: {
						 content: "{PRCOM}"
					   }
					 },
					 {
					   name: "Bonificación",
					   template: {
						 content: "{BONIF}"
					   }
					 },
					 {
					   name: "Max",
					   template: {
						 content: "{PRCMX}"
					   }
					 
					 },
					 {
					   name: "Tope",
					   template: {
						 content: "{PRCTP}"
					   }
					 
					 },
					 {
					   name: "Moneda",
					   template: {
						 content: "{WAERS}"
					   }
					 
					 },
					 {
					   name: "Estado",
					   template: {
						 content: "{ESPRC}"
					   }
					 },
					 {
					   name: "Especie",
					   template: {
						 content: "{DSSPC}"
					   }
					 },
					 {
					   name: "Calidad",
					   template: {
						 content: "{CALIDA}"
					   }
					 },
   
				   ]
				 });
				 oExport.saveFile("Precios de Acopio").catch(function(oError) {
				   MessageBox.error("Error when downloading data. ..." + oError);
				 }).then(function() {
				   oExport.destroy();
				 });
			   },
			   filterGlobally : function(oEvent) {
				 var sQuery = oEvent.getParameter("query");
				 this._oGlobalFilter = null;
	   
					   if (sQuery) {
						   this._oGlobalFilter = new Filter([
							   new Filter("NRMAR", FilterOperator.Contains, sQuery),
							   new Filter("NRDES", FilterOperator.Contains, sQuery),
							   new Filter("DESCR", FilterOperator.Contains, sQuery),
							   new Filter("CDSPC", FilterOperator.Contains, sQuery),
							   new Filter("FIDES", FilterOperator.Contains, sQuery),
							   new Filter("HIDES", FilterOperator.Contains, sQuery),
							   new Filter("FFDES", FilterOperator.Contains, sQuery),
							   new Filter("HFDES", FilterOperator.Contains, sQuery),
							   new Filter("FECCONMOV", FilterOperator.Contains, sQuery),
							   new Filter("NMEMB", FilterOperator.Contains, sQuery),
							   new Filter("NAME1", FilterOperator.Contains, sQuery),
							   new Filter("WAERS", FilterOperator.Contains, sQuery),
							   new Filter("ESPRC", FilterOperator.Contains, sQuery),
							   new Filter("DSSPC", FilterOperator.Contains, sQuery),
							   new Filter("CALIDA", FilterOperator.Contains, sQuery)
							   
						   ], false);
					   }
	   
					   this._filter();
				   },
				   _filter : function() {
					 var oFilter = null;
			   
					 if (this._oGlobalFilter && this._oPriceFilter) {
					   oFilter = new Filter([this._oGlobalFilter, this._oPriceFilter], true);
					 } else if (this._oGlobalFilter) {
					   oFilter = this._oGlobalFilter;
					 } else if (this._oPriceFilter) {
					   oFilter = this._oPriceFilter;
					 }
			   
					 this.byId("table").getBinding().filter(oFilter, "Application");
					   },
					   _onOpenDialogArmador: function(evn) {
				
						this.popUp=evn;
						this.getView().getModel("Armador").setProperty("/listaArmador","");
						this._getDialogArmador().open();
					},
			
					_onCloseDialogArmador: function() {
						this._getDialogArmador().close();
						sap.ui.getCore().byId("idRuc2").setValue("");
						sap.ui.getCore().byId("idDescripcion").setValue("");
						sap.ui.getCore().byId("idCuentaProveedor").setValue("");
						sap.ui.getCore().byId("idListaArmador").setText("Lista de registros:");
						
					},
			
					_getDialogArmador : function () {
						if (!this._oDialogArmador) {
							this._oDialogArmador = sap.ui.xmlfragment("tasa.com.aprobacionprecios.view.DlgArmador", this.getView().getController());
							this.getView().addDependent(this._oDialogArmador);
							sap.ui.getCore().byId("idAciertosPop").setValue("200");
						}
						
						return this._oDialogArmador;
					},
					buscar: function(evt){
						console.log(evt);
						var indices = evt.mParameters.listItem.oBindingContexts.Armador.sPath.split("/")[2];
						console.log(indices);
						var data = this.getView().getModel("Armador").oData.listaArmador[indices].LIFNR;
						if(this.popUp==="popOne"){
							this.byId("idArmadorIni").setValue(data);
						}else if(this.popUp==="popTwo"){
							this.byId("idArmadorFin").setValue(data);
						}
						
						this._onCloseDialogArmador();	
					},		  
					castFechas: function(fecha){
						var arrayFecha=fecha.split("/");
						console.log(arrayFecha);
						var fechas = arrayFecha[2]+""+arrayFecha[1]+""+arrayFecha[0];
						return fechas;
					},
					buscarEmbarca: function(evt){
						console.log(evt);
						var indices = evt.mParameters.listItem.oBindingContexts.Embarcacion.sPath.split("/")[2];
						console.log(indices);
						var data = this.getView().getModel("Embarcacion").oData.listaEmbarcacion[indices].CDEMB;
						if(this.popEmb==="popEmb"){
							this.byId("idEmbarcacionIni").setValue(data);
						}else if(this.popEmb==="popEmb2"){
							this.byId("idEmbarcacionFin").setValue(data);
						}
						this._onCloseDialogEmbarcacion();
						
					},
					_onOpenDialogEmbarcacion: function(popup) {
		
						this.popEmb=popup;
						this.getView().getModel("Embarcacion").setProperty("/listaEmbarcacion","");
						this._getDialogEmbarcacion().open();
						
						},
			
						_onCloseDialogEmbarcacion: function() {
							this._getDialogEmbarcacion().close();
						},
			
						_getDialogEmbarcacion : function () {
							if (!this._oDialogEmbarcacion) {
								this._oDialogEmbarcacion = sap.ui.xmlfragment("tasa.com.aprobacionprecios.view.DlgEmbarcacion", this.getView().getController());
								this.getView().addDependent(this._oDialogEmbarcacion);
							}
							sap.ui.getCore().byId("idEmbarcacion").setValue("");
						sap.ui.getCore().byId("idEmbarcacionDesc").setValue("");
						sap.ui.getCore().byId("idMatricula").setValue("");
						sap.ui.getCore().byId("idRuc").setValue("");
						sap.ui.getCore().byId("idArmador").setValue("");
							return this._oDialogEmbarcacion;
						}
					
		});
	});
