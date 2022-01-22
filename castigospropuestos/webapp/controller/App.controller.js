sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (BaseController,Controller,JSONModel,History,MessageBox,Filter,FilterOperator,Export,ExportTypeCSV) {
		"use strict";
		//const this.onLocation() = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'
		var JsonFechaIni={
			fechaIni:"",
			fechaIni2:""
		};
		var popEmb="";
		var oGlobalBusyDialog = new sap.m.BusyDialog();
		var usuario="";
		return BaseController.extend("tasa.com.castigospropuestos.controller.App", {
			onInit: function () {
				let ViewModel= new JSONModel(
					{}
					);
					this.setModel(ViewModel,"litoral");
					this.setModel(ViewModel,"precio");
					this.setModel(ViewModel,"reporteCala")
					this.byId("idAciertos").setValue("200");
					this.listPlanta();
					this.loadIndicadorP();
				
					this._getCurrentUser();

			},
			_getCurrentUser: async function(){
							let oUshell = sap.ushell,
							oUser={};
							if(oUshell){
								let  oUserInfo =await sap.ushell.Container.getServiceAsync("UserInfo");
								let sEmail = oUserInfo.getEmail().toUpperCase(),
								sName = sEmail.split("@")[0],
								sDominio= sEmail.split("@")[1];
								if(sDominio === "XTERNAL.BIZ") sName = "FGARCIA";
								oUser = {
									name:sName
								}
							}else{
								oUser = {
									name: "FGARCIA"
								}
							}
				
							this.usuario=oUser.name;
							console.log(this.usuario);
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
				fetch(`${ this.onLocation()}embarcacion/ConsultarEmbarcacion/`,
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
				fetch(`${ this.onLocation()}dominios/Listar/`,
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
  
				
				if(id==="application-castigospropuestos-display-component---App--idFechaIniVigencia")
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
			
			listPlanta: function(){
				var dataPlantas={
					"delimitador": "|",
					"fields": [
					 
					],
					"no_data": "",
					"option": [
						{
							cantidad: "20",
							control:"MULTIINPUT",
							key:"INPRP",
							valueHigh: "",
							valueLow:"P"
						},
						{
							cantidad: "20",
							control:"MULTIINPUT",
							key:"ESREG",
							valueHigh: "",
							valueLow:"S"
						}
					],
					"options": [
					  
					],
					"order": "",
					"p_user": this.usuario,
					"rowcount": 0,
					"rowskips": 0,
					"tabla": "ZV_FLPL"
				  }
				  fetch(`${ this.onLocation()}General/Read_Table`,
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
		   
		   loadTablaPreciosAcopio: function(){
				oGlobalBusyDialog.open();
			   let idPlantaIni = this.byId("idPlantaIni").getValue();
			   let idPlantaFin= this.byId("idPlantaFin").getValue();
			   let idEmbarcacionIni = this.byId("idEmbarcacionIni").getValue();
			   let idEmbarcacionFin =this.byId("idEmbarcacionFin").getValue();
			   let radio1 = this.byId("rbgtype").getSelectedButton().getText();
			   let idAciertos =this.byId("idAciertos").getValue();
			   let option=[];
			   let options=[];
			   let idEstado="";

			   var fechaIni = this.byId("idFechaIniVigencia").getValue();
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
			   if(!idAciertos){
				  MessageBox.error("Debe ingresar cantida de aciertos");
				  return false;
			   }
			   if(radio1 ==="Pendientes de castigo"){
				   console.log("entró");
				   idEstado="PC";
			   }
			   if(idPlantaIni || idPlantaFin){
				   options.push({
					   cantidad: "10",
					   control:"MULTIINPUT",
					   key:"WERKS",
					   valueHigh: idPlantaFin,
					   valueLow:idPlantaIni
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
			   if(fechaIniVigencia || fechaIniVigencia2){
				   options.push({
					   cantidad: "10",
					   control:"MULTIINPUT",
					   key:"FECCONMOV",
					   valueHigh: fechaIniVigencia2,
					   valueLow:fechaIniVigencia
				   });
			   }
			   
			   console.log(radio1);
			   
				 let body = {
					"id_estado": idEstado,
					"num_application": 3,
					"p_calidad": "TMP-HP34",
					"p_flag": "X",
					"p_indpr": "C",
					"p_option": option,
					"p_options": options,
					"p_rows": idAciertos,
					"p_user": this.usuario
				   }
				   var indice=-1;
				   console.log(body);
				  fetch(`${ this.onLocation()}preciospesca/ConsultarPrecioMar`,
					   {
						   method: 'POST',
						   body: JSON.stringify(body)
					   })
					   .then(resp => resp.json()).then(data => {
							console.log(data.str_pm)
						   for(var valor in data.str_pm){
							   if(data.str_pm[valor].WAERS==="USD"){
								   data.str_pm[valor].WAERSDESC="- DOLARES AMERICANOS";
							   }
							   if(data.str_pm[valor].NRMAR){
								 data.str_pm[valor].NRMAR= this.zeroFill(data.str_pm[valor].NRMAR,10);
							   
							   }
						   }
						   for(var i=0;i<data.str_pm.length;i++){
							data.str_pm[i].PRCMX = parseFloat(data.str_pm[i].PRCMX).toFixed(2);
							data.str_pm[i].PRCOM = parseFloat(data.str_pm[i].PRCOM).toFixed(2);
							data.str_pm[i].PRCTP = parseFloat(data.str_pm[i].PRCTP).toFixed(2);
							data.str_pm[i].PCSPP = parseFloat(data.str_pm[i].PCSPP).toFixed(2);
							data.str_pm[i].JUVEN = parseFloat(data.str_pm[i].JUVEN).toFixed(2);
						}
						data.str_pm.total=data.str_pm.length;
						this.byId("title").setText("Lista de registros: "+data.str_pm.total);
						   this.getModel("CastigosPropuestos").setProperty("/items", data.str_pm);
						
						   if(data.str_pm.length<=0){
							this.byId("title").setText("Lista de registros: No se encontraron resultados");
						   }
							oGlobalBusyDialog.close();
						  
					   }).catch(error => console.log(error)
					   );
		   },		  
		   castFechas: function(fecha){
			   var arrayFecha=fecha.split("/");
			   console.log(arrayFecha);
			   var fechas = arrayFecha[2]+""+arrayFecha[1]+""+arrayFecha[0];
			   return fechas;
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
		   editRow: function(oEvent){
			   var cadena=oEvent.getSource().getBindingContext("CastigosPropuestos").getPath().split("/")[2];
			   
			   this.getRouter().navTo("EditarCastigosPropuestos",{cadena});
			   
			  
		   },
		   editarMasivo: function(oEvent){
			 var indices = this.byId("table").getSelectedIndices();
			 var cadena ="";
			 for(var i=0;i<indices.length;i++){
				 cadena += indices[i]+",";
			 }
			 var cadena=cadena.substring(0,cadena.length-1)
			 console.log(cadena);
			  this.getRouter().navTo("EditarCastigosPropuestos",{cadena});
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
			   onDataExport:  function() {
				   var oExport = new Export({
					   exportType: new ExportTypeCSV({ // required from "sap/ui/core/util/ExportTypeCSV"
						 separatorChar: ";",
						 charset: "utf-8"
					   }),
					   //PoliticaPrecio>/listaPolitica
					   models: this.getView().getModel("CastigosPropuestos"),
					   rows:{path:""},
					   rows: { path: "/items" },
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
				   limpiarFiltros: function(){
					this.byId("idPlantaIni").setValue("");
					this.byId("idPlantaFin").setValue("");
					 this.byId("idEmbarcacionIni").setValue("");
					this.byId("idEmbarcacionFin").setValue("");
					this.byId("idFechaIniVigencia").setValue("");
					var JsonFechaIni={
						fechaIni:"",
						fechaIni2:""
					};
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
							this._oDialogEmbarcacion = sap.ui.xmlfragment("tasa.com.castigospropuestos.view.DlgEmbarcacion", this.getView().getController());
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
