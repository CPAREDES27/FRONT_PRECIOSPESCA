sap.ui.define([
	"./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    'sap/m/MessageBox',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
    "sap/ui/core/util/ExportTypeCSV",
    "sap/ui/core/util/Export",
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	 function (BaseController,Controller,JSONModel,History,MessageBox,Filter,FilterOperator,exportLibrary, Spreadsheet,ExportTypeCSV,Export) {
		"use strict";
		const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';
		var oGlobalBusyDialog = new sap.m.BusyDialog();
		var JsonFechaIni={
			fechaIni:"",
			fechaIni2:""
		};
		var exportarExcel=false;
		var EdmType = exportLibrary.EdmType;
		return BaseController.extend("tasa.com.preciosponderados.controller.App", {
			onInit: function () {
				let ViewModel= new JSONModel(
					{}
					);
					var oGlobalBusyDialog = new sap.m.BusyDialog();
					this.setModel(ViewModel,"litoral");
					this.setModel(ViewModel,"precio");
					this.setModel(ViewModel,"reporteCala")
					
					
			},

		// 	goBackMain: function () {
		// 		   this.getRouter().navTo("RouteApp");
		// 		   location.reload();
		//    },
		buscarFecha: function(oEvent){
			
			var dateIni= new Date(oEvent.mParameters.from);
			var dateIni2 = new Date(oEvent.mParameters.to);
			console.log(oEvent.mParameters.from);
			console.log(oEvent.mParameters.to)
			console.log(dateIni);
			console.log(dateIni2);
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

			
			if(id==="application-preciosponderados-display-component---App--idFechaProduccion")
			{
				JsonFechaIni={
					fechaIni:fechaIni,
					fechaIni2:fechaIni2
				}
			}
		    console.log("Fecha generada " +JsonFechaIni);
		
		   
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
		generateFecha: function(date){
	
			var day=date.getDate();
			var anio=date.getFullYear();
			var mes=date.getMonth()+1;
			console.log(day);
			console.log(anio);
			console.log(mes);
			if(mes<10){
				mes=this.zeroFill(mes,2);
			}
			if(day<10){
				day=this.zeroFill(day,2);
			}
			var fecha= anio.toString()+mes.toString()+day.toString();
		   console.log(fecha);
		   
			return fecha;
		},		  
		castFechas: function(fecha){
			var arrayFecha=fecha.split("/");
			console.log(arrayFecha);
			var fechas = arrayFecha[2]+""+arrayFecha[1]+""+arrayFecha[0];
			return fechas;
		},
		   loadTablaPrecioPonderado: function(){
			   oGlobalBusyDialog.open();
			   let fecha=this.byId("idFechaProduccion").getValue();
			   console.log(fecha);
			   let idMALABRIGO = this.byId("idMALABRIGO").getSelected();
			   let idCALLAO = this.byId("idCALLAO").getSelected();
			   let idSAMANCO = this.byId("idSAMANCO").getSelected();
			   let idSUPE = this.byId("idSUPE").getSelected();
			   let idVEGUETA = this.byId("idVEGUETA").getSelected();
			   let idILO = this.byId("idILO").getSelected();
			   let idPISCOSUR = this.byId("idPISCOSUR").getSelected();
			   let idATICO = this.byId("idATICO").getSelected();
			   let idMATARANI = this.byId("idMATARANI").getSelected();
			   let idCHIMBOTE = this.byId("idCHIMBOTE").getSelected();
			   let idTASAARTILLERO = this.byId("idTASAARTILLERO").getSelected();
			   let idTASACHD = this.byId("idTASACHD").getSelected();
			   let idCHIMBOTESUR = this.byId("idCHIMBOTESUR").getSelected();
			   let idPISCONORTE = this.byId("idPISCONORTE").getSelected();

			   let options=[];
			   var planta="";
			   var error=""
			   var estado=true;
			   if(!fecha){
				error="Debe ingresar una fecha de inicio de vigencia\n";
				estado=false;
			   }
			   if(!estado){
				MessageBox.error(error);
				oGlobalBusyDialog.close()
				return false;
				}
				var feccc =[];
			   feccc= fecha.trim().split("-");
			   for(var i=0;i<feccc.length;i++){
				   feccc[i]=feccc[i].trim();
			   }
			   var fechaIniVigencia= this.castFechas(feccc[0]);
			   var fechaIniVigencia2= this.castFechas(feccc[1]);
			   console.log(fechaIniVigencia+" "+fechaIniVigencia2);

			   if(idMALABRIGO){
				   options.push({
					cantidad: "10",
					control:"MULTICOMBOBOX",
					key:"CDPTA",
					valueHigh: "",
					valueLow: "0005"
				   });
			   }
			   if(idCALLAO){
				   options.push({
					cantidad: "10",
					control:"MULTICOMBOBOX",
					key:"CDPTA",
					valueHigh: "",
					valueLow: "0012"
				   });
			   }
			   if(idSAMANCO){
				   options.push({
					cantidad: "10",
					control:"MULTICOMBOBOX",
					key:"CDPTA",
					valueHigh: "",
					valueLow: "0009"
				   });
			   }
			   if(idSUPE){
				   options.push({
					cantidad: "10",
					control:"MULTICOMBOBOX",
					key:"CDPTA",
					valueHigh: "",
					valueLow: "0010"
				   });
			   }
			   if(idVEGUETA){
				   options.push({
					cantidad: "10",
					control:"MULTICOMBOBOX",
					key:"CDPTA",
					valueHigh: "",
					valueLow: "0011"
				   });
			   }
			   if(idILO){
				   options.push({
					cantidad: "10",
					control:"MULTICOMBOBOX",
					key:"CDPTA",
					valueHigh: "",
					valueLow: "0019"
				   });
			   }
			   if(idPISCOSUR){
				   options.push({
					cantidad: "10",
					control:"MULTICOMBOBOX",
					key:"CDPTA",
					valueHigh: "",
					valueLow: "0015"
				   });
			   }
			   if(idATICO){
				   options.push({
					cantidad: "10",
					control:"MULTICOMBOBOX",
					key:"CDPTA",
					valueHigh: "",
					valueLow: "0016"
				   });
			   }
			   if(idMATARANI){
				   options.push({
					cantidad: "10",
					control:"MULTICOMBOBOX",
					key:"CDPTA",
					valueHigh: "",
					valueLow: "0018"
				   });
			   }
			   if(idCHIMBOTE){
				   options.push({
					cantidad: "10",
					control:"MULTICOMBOBOX",
					key:"CDPTA",
					valueHigh: "",
					valueLow: "0119"
				   });
			   }
			   if(idTASAARTILLERO){
				   options.push({
					cantidad: "10",
					control:"MULTICOMBOBOX",
					key:"CDPTA",
					valueHigh: "",
					valueLow: "0125"
				   });
			   }
			   if(idTASACHD){
				   options.push({
					cantidad: "10",
					control:"MULTICOMBOBOX",
					key:"CDPTA",
					valueHigh: "",
					valueLow: "0021"
				   });
			   }
			   if(idCHIMBOTESUR){
				   options.push({
					cantidad: "10",
					control:"MULTICOMBOBOX",
					key:"CDPTA",
					valueHigh: "",
					valueLow: "0007"
				   });
			   }
			   if(idPISCONORTE){
				   options.push({
					cantidad: "10",
					control:"MULTICOMBOBOX",
					key:"CDPTA",
					valueHigh: "",
					valueLow: "0014"
				   });
			   }
			   
   
			   if(planta==""){
				oGlobalBusyDialog.close();
				MessageBox.error("Debe escoger al menos una planta");
				return false;
			   }
			   console.log(planta.substring(0,planta.length-4));
			   console.log(JsonFechaIni);
			   if(fechaIniVigencia || fechaIniVigencia2){
				   options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"FECCONMOV",
						valueHigh: fechaIniVigencia2,
						valueLow: fechaIniVigencia
					});
			   }else{
				oGlobalBusyDialog.close();
				   MessageBox.error("Debe ingresar una fecha de producción inicial");
				   return false;
			   }
	
			   
			  
			   console.log(idMALABRIGO);
			   let body = {
						"option": [],
					   "options": options
					}
					console.log(body);
					var indice=-1;
				   fetch(`${mainUrlServices}preciospesca/ObtenerPrecioPond`,
						{
							method: 'POST',
							body: JSON.stringify(body)
						})
						.then(resp => resp.json()).then(data => {
						   if(data){
							exportarExcel=true;
						   }
						   console.log(data.total);
						   console.log(data)
						   let ViewModel= new JSONModel();
						   var dataPrecio = data;
						   ViewModel.setData(dataPrecio);
						   this.getView().setModel(ViewModel);
						   var valor= this.getView().getModel();
						   console.log(valor.oData);
						   if(data.t_PRCPESCPTA.length>0){
						   var currentRows = valor.getProperty("/t_PRCPESCPTA");
						   var newRows = currentRows.concat(this.createEntry(data.total));
						   valor.setProperty("/t_PRCPESCPTA", newRows);
						 
						   
						   }
						   console.log(this.byId("table"));
						   //this.getModel("reporteCala").setProperty("/items",data.t_PRCPESCPTA);
						   oGlobalBusyDialog.close();
						   
						}).catch(error => MessageBox.error("El servicio no está disponible",oGlobalBusyDialog.close())
						);
   
			   },
			   limpiarFiltros: function(){
				this.byId("idCALLAO").setSelected(false);
				this.byId("idMALABRIGO").setSelected(false);
				this.byId("idCALLAO").setSelected(false);
				this.byId("idSAMANCO").setSelected(false);
				this.byId("idSUPE").setSelected(false);
				this.byId("idVEGUETA").setSelected(false);
				this.byId("idILO").setSelected(false);
				this.byId("idPISCOSUR").setSelected(false);
				this.byId("idATICO").setSelected(false);
				this.byId("idMATARANI").setSelected(false);
				this.byId("idCHIMBOTE").setSelected(false);
				this.byId("idTASAARTILLERO").setSelected(false);
				this.byId("idTASACHD").setSelected(false);
				this.byId("idCHIMBOTESUR").setSelected(false);
				this.byId("idPISCONORTE").setSelected(false);
				this.byId("idFechaProduccion").setValue("");
				JsonFechaIni.fechaIni2="";
				JsonFechaIni.fechaIni="";
			   },
		   goBackMain: function () {
				   this.getRouter().navTo("RouteApp");
				   location.reload();
			   },
   
			   createEntry: function(data) {
   
			   return {
   
				   NOMPTA: "Total",
   
				   PRCPOND: data
   
			   };
   
			   },
			   onSearch: function (oEvent) {
				// add filter for search
				var aFilters = [];
				var sQuery = oEvent.getSource().getValue();
				if (sQuery && sQuery.length > 0) {
					var filter = new Filter([
						new Filter("NOMPTA", FilterOperator.Contains, sQuery)
					]);
					aFilters.push(filter);
				}
	
				// update list binding
				var oList = this.byId("table");
				var oBinding = oList.getBinding("rows");
				oBinding.filter(aFilters, "Application");
			},
			   filterGlobally : function(oEvent) {
				   var sQuery = oEvent.getParameter("query");
				   this._oGlobalFilter = null;
   
				   if (sQuery) {
					   this._oGlobalFilter = new Filter([
						   new Filter("NOMPTA", FilterOperator.Contains, sQuery)
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
				   models: this.getView().getModel(),
				   rows:{path:""},
				   rows: { path: "/t_PRCPESCPTA" },
				   columns: [
					 {
					   name: "Código de Precio",
					   template: {
						 content: "{NOMPTA}"
					   }
					 },
					 {
					   name: "Zona de Pesca",
					   template: {
						 content: "{PRCPOND}"
					   }
					 },
					 
				   ]
				 });
				 oExport.saveFile("Politica de Precios").catch(function(oError) {
				   MessageBox.error("Error when downloading data. ..." + oError);
				 }).then(function() {
				   oExport.destroy();
				 });
			   },
			   //Excel

			   createColumnConfig5: function() {
				return [
					{
						label: 'Código de Precio',
						property: 'NOMPTA' ,
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Zona de Pesca',
						property: 'PRCPOND' ,
						type: EdmType.String,
						scale: 2
					}
					
					];
			},
			onExportarExcelData: function() {
				oGlobalBusyDialog.open();
				if(!exportarExcel){
					MessageBox.error("Porfavor, realizar una búsqueda antes de exportar");
					oGlobalBusyDialog.close();
					return false;
				}
				var aCols, aProducts, oSettings, oSheet;
	
				aCols = this.createColumnConfig5();
				console.log(this.getView().getModel());
				aProducts = this.getView().getModel().getProperty('/t_PRCPESCPTA');
	
				oSettings = {
					
					workbook: { 
						columns: aCols,
						context: {
							application: 'Debug Test Application',
							version: '1.95.0',
							title: 'Some random title',
							modifiedBy: 'John Doe',
							metaSheetName: 'Custom metadata'
						}
						
					},
					dataSource: aProducts,
					fileName:"Reporte de precios ponderados"
				};
	
				oSheet = new Spreadsheet(oSettings);
				oSheet.build()
					.then( function() {
						MessageToast.show('El Archivo ha sido exportado correctamente');
					})
					.finally(oSheet.destroy);
					oGlobalBusyDialog.close();
			},
			  
		});
	});
