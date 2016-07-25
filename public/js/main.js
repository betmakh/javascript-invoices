angular.module('invoicesApp', ['ngRoute'])
  .controller('InvoiceController', ['$scope', '$http', '$filter', function($scope, $http, $filter) {
    var getInvoices = function() {
      $http.get('/api/invoices').then(function(resp) {
        $scope.invoices = resp.data;
      }, function(resp) {
        console.error(resp);
      })
    }
    $scope.invoices = [];
    $scope.invoiceItem = {};
    $scope.invoice = {
      total: 0,
      discount: 0
    };
    $scope.invoiceItems = [];
    $scope.deleteInvoice = function(id) {
      var invoice = _.find($scope.invoices, function(item) {
        return item.id == id
      })
      $http.delete('/api/invoices/' + id).then(function(resp) {
        $scope.invoices = _.filter($scope.invoices, function(el) {
            return invoice != el
          })
          // $scope.invoices.filter(function(index) {
          // 	return something;
          // });

      })
    }
    $scope.addInvoice = function() {
      $http.post('/api/invoices', $scope.invoice).then(function(resp) {
        console.log(resp);
        $scope.invoiceItems.forEach(function(element, index) {
          $http.post('/api/invoices/' + resp.data.id + '/items', element).then(function(resp) {
            console.log(resp)
          })
        });
        getInvoices();
        $('#invoiceModal').modal('hide');
        $scope.invoice = {
          total: 0,
          discount: 0
        };
      })
      console.log('click')
    }
    $scope.addProduct = function(product) {
      var isExist = _.find($scope.invoiceItems, function(el) {
        return el.product_id === product.product_id
      })
      if (isExist) {
        $scope.invoiceItems[$scope.invoiceItems.indexOf(isExist)].quantity += product.quantity;
      } else {
        $scope.invoiceItems.push(product)
      }
      $scope.invoiceItem = {};
      $scope.calculateTotal($scope.invoiceItems);
    }
    $scope.calculateTotal = function(items) {
      var total = 0;
      items = items || $scope.invoiceItems;
      items.forEach(function(element) {
        var product = _.find($scope.products, function(el) {
          return el.id == element.product_id
        })
        total += product.price * element.quantity;
      });
      total -= total * ($scope.invoice.discount / 100);
      $scope.invoice.total = total;
    }
    getInvoices();

    $http.get('/api/customers').then(function(resp) {
      $scope.customers = resp.data;
    }, function(resp) {
      console.error(resp);
    })

    $http.get('/api/products').then(function(resp) {
      console.log(resp)
      $scope.products = resp.data;
    }, function(resp) {
      console.error(resp);
    })
  }])
  .controller('CustomersController', ['$scope', '$http', function($scope, $http) {
    $scope.customers = [];
    $http.get('/api/customers').then(function(resp) {
      console.log(resp)
      $scope.customers = resp.data;
    }, function(resp) {
      console.error(resp);
    })
  }])
  .controller('ProductsController', ['$scope', '$http', function($scope, $http) {
    $scope.products = [];
    $http.get('/api/products').then(function(resp) {
      console.log(resp)
      $scope.products = resp.data;
    }, function(resp) {
      console.error(resp);
    })
  }])
  //  .directive('nameProduct', function() {
  //   return {
  //   	template: function() {
  //   		console.log(arguments)
  //   		return 'Name: {{$id}} {{invoice | {id: $id}}}'
  //   	},
  //     link: function (scope) {
  //     	console.log(scope)
  //     	scope.name = "zalupa"
  //     }
  //   };
  // })
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/customers', {
        templateUrl: '/js/app/templates/customers.template.html',
        controller: 'CustomersController',
      })
      .when('/products', {
        templateUrl: '/js/app/templates/products.template.html',
        controller: 'ProductsController',
      })
      .when('/invoices', {
        templateUrl: '/js/app/templates/invoices.template.html',
        controller: 'InvoiceController'
      });
    $locationProvider.html5Mode(true);
  });
