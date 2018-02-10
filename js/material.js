'use strict'

/*
 * Copyright (C) 2018 Simão Gomes Viana
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

$('html').attr('ng-app', 'MaterialApp')
const waitForBody = (func) => {
  if ((typeof document.body) === 'undefined' || !document.body) {
    setTimeout(() => {
      waitForBody(func)
    }, 1)
  } else {
    func()
  }
}
waitForBody(() => {
  $('body').attr('ng-controller', 'MaterialController')
})

// http://www.javascripter.net/faq/hextorgb.htm
function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
// http://www.javascripter.net/faq/rgbtohex.htm
function rgbToHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}
function toHex(n) {
 n = parseInt(n,10);
 if (isNaN(n)) return "00";
 n = Math.max(0,Math.min(n,255));
 return "0123456789ABCDEF".charAt((n-n%16)/16)
      + "0123456789ABCDEF".charAt(n%16);
}

function getRgbaFromHex (hexcol, alpha) {
  if (alpha > 1.0) alpha /= 100
  return 'rgba(' + hexToR(hexcol) + ',' + hexToG(hexcol) + ',' +
            hexToB(hexcol) + ',' + alpha + ')'
}

function material_log (msg) {
  if (msg instanceof Object) {
    console.log("MaterialJS: ")
    console.log(msg)
  } else {
    console.log("[MaterialJS] " + msg)
  }
  return msg
}

material_log("MaterialJS is here!")

var materialStorage = {
  controllerStorage: {
    nav: {},
    switches: {},
    progressCount: 0,
    dialogCount: 0,
  },
  onReadyToStyle: () => {},
  primaryColor: '#212121',
  primaryLightColor: '#424242',
  primaryDarkColor: '#121212',
  accentColor: '#1976D2',
  accentLightColor: '#1E88E5',
  accentDarkColor: '#1565C0'
}

$(() => {
  materialStorage.theme = material.theme.light

  var applicationElem = $('meta[name="application"]')
  if ((typeof applicationElem) !== 'undefined') {
    material.setTheme(
      applicationElem.attr('theme') === 'dark' ?
        material.theme.dark : material.theme.light
    )
    material.setPrimaryColors(
      applicationElem.attr('color-primary'),
      applicationElem.attr('color-primary-light'),
      applicationElem.attr('color-primary-dark')
    )
    material.setAccentColors(
      applicationElem.attr('color-accent'),
      applicationElem.attr('color-accent-light'),
      applicationElem.attr('color-accent-dark')
    )
  }

  materialStorage.onReadyToStyle()
  material.applyStyle()
})

var material = {
  registerApp: () => {
    material_log("Registering new app")
    var app = angular.module('MaterialApp', [])
    materialStorage.app = app
    app.controller('MaterialController', ($scope, $rootScope) => {
      $scope.storage = materialStorage.controllerStorage
      $rootScope.mtrlstorage = $scope.storage
      $scope.storage.switches.count = 0
      material_log("Controller registered")
    }) // MaterialController
    app.directive('tabber', () => {
      return {
        restrict: 'E',
        transclude: true,
        template:
          '<div class="material tabber {{tabber_theme}}" ng-transclude></div>',
        scope: {
          tabber_theme: "@theme",
          tabber_items: "@items"
        }
      }
    }) // Directive tabber
    app.directive('page', () => {
      return {
        restrict: 'E',
        transclude: true,
        template:
          '<div class="material page" id="mtrlPage{{name}}" ng-transclude ' +
          'ng-class="{active: active()}"></div>',
        scope: {
          name: "@"
        },
        link: ($scope, elem, attrs) => {
          $scope.tabber = $(elem).parent().parent().attr('tabber')
          $scope.active = () => {
            return materialStorage.controllerStorage.nav[
              $scope.tabber][attrs.name].item.active
          }
        }
      }
    }) // Directive page
    app.directive('textfield', () => {
      return {
        restrict: 'E',
        template:
          '<input type="{{type}}" class="material textfield" placeholder='+
          '"{{placeholder}}">',
        scope: {
          type: "@",
          placeholder: "@"
        }
      }
    }) // Directive textfield
    app.directive('switch', () => {
      return {
        restrict: 'E',
        template:
          '<div class="material switch-container">' +
            '{{beforeText}}' +
            '<div class="material switch">' +
              '<div class="material switch-thumb"></div>' +
            '</div>' +
            '{{afterText}}' +
          '</div>',
        scope: {
          beforeText: "@?beforetext",
          afterText: "@?aftertext",
          onchangelistener: "@?onchangelistener"
        },
        link: ($scope, elem, attrs) => {
          let switches = $scope.$root.mtrlstorage.switches
          var identifier = 'switch_' + switches.count++
          var elem = $(elem)
          let switchitem = switches[identifier] = {
            element: elem,
            thumb: elem.find('.material.switch-thumb'),
            track: elem.find('.material.switch'),
            enabled: false
          }
          var onchangelistener = $scope.$root.mtrlstorage.switches[
            $scope.onchangelistener + '_chlistener'
          ] || ((s, e) => {})
          switchitem.xMax = switchitem.track.width() - switchitem.thumb.width(),
          switchitem.xDiff = 0,
          switchitem.diffX = () => {
            return (switchitem.iMouseX >= switchitem.mouseX) ? 0 :
              (switchitem.xMax <=
                (switchitem.mouseX - switchitem.iMouseX) ? switchitem.xMax :
              switchitem.mouseX - switchitem.iMouseX)
          },
          switchitem.doSwitch = (enable) => {
            var triggerOnChange = false
            if (enable === true ||
                (enable !== false && switchitem.xDiff >= switchitem.xMax / 2)) {
              switchitem.xDiff = switchitem.xMax
              if (!switchitem.enabled) {
                switchitem.enabled = true
                switchitem.track.addClass('enabled')
                triggerOnChange = true
              }
            } else {
              switchitem.xDiff = 0
              if (switchitem.enabled) {
                switchitem.enabled = false
                switchitem.track.removeClass('enabled')
                triggerOnChange = true
              }
            }
            switchitem.thumb.css('transform',
              'translateX(' + switchitem.xDiff + 'px) translateY(-2px)')
            if (triggerOnChange) {
              onchangelistener(switchitem, switchitem.enabled)
            }
          }
          switchitem.track.click(() => {
            if (switchitem.preventTrackFire) {
              switchitem.preventTrackFire = false
              return
            }
            switchitem.active = false
            switchitem.doSwitch(!switchitem.enabled)
            switchitem.hasMoved = false
          })
          switchitem.thumb.on('mousedown', (e) => {
            switchitem.active = true
            switchitem.hasMoved = false
            switchitem.wasDown = true
            switchitem.preventTrackFire = false
            switchitem.iMouseX = e.pageX - switchitem.xDiff
            switchitem.mouseX = e.pageX
          })
          switchitem.thumb.on('mouseup', (e) => {
            switchitem.active = false
            if (switchitem.hasMoved) {
              switchitem.doSwitch()
            } else {
              switchitem.doSwitch(!switchitem.enabled)
            }
            switchitem.hasMoved = false
            switchitem.preventTrackFire = true
          })
          switchitem.thumb.on('mouseleave', (e) => {
            switchitem.active = false
            switchitem.doSwitch()
          })
          switchitem.thumb.on('mousemove', (e) => {
            if (!switchitem.active) return
            switchitem.mouseX = e.pageX
            switchitem.xDiff = switchitem.diffX()
            switchitem.thumb.css('transform', 'translateX(' +
              switchitem.xDiff + 'px) translateY(-2px)')
            switchitem.hasMoved = switchitem.xDiff > 3
          })
        }
      }
    }) // Directive switch
    app.directive('categoryHeader', () => {
      return {
        restrict: 'E',
        transclude: true,
        template:
          '<span class="material category-header" ng-transclude></span>'
      }
    }) // Directive categoryHeader
    app.directive('btn', () => {
      return {
        restrict: 'E',
        template:
          '<div class="material button {{style}}">{{text}}</div>',
        scope: {
          style: "@?",
          text: "@",
          click: "@?"
        },
        link: ($scope, elem, attrs) => {
          $(elem).click(() => {
            if (!!$scope.click) {
              $scope.$root.mtrlstorage['button_click_' + $scope.click]()
            }
          })
        }
      }
    }) // Directive btn
    app.directive('actionbar', () => {
      return {
        restrict: 'E',
        transclude: true,
        template:
          '<nav class="material actionbar">' +
            '<span class="material actionbar-title">{{title}}</span>' +
            '<div ng-transclude></div>' +
          '</nav>',
        scope: {
          title: '@'
        }
      }
    }) // Directive actionbar
    app.directive('mainContainer', () => {
      return {
        restrict: 'E',
        transclude: true,
        template:
          '<div class="material main-container" ng-class="{\'with-tabber\': tabber}"' +
          ' ng-transclude></div>',
        scope: {
          tabber: '@'
        }
      }
    }) // Directive mainContainer
    app.directive('tabberItem', () => {
      return {
        restrict: 'E',
        template: '<div class="material tab" ' +
                  'ng-class="{active: active()}" ' +
                  'ng-click="switchToPage()"' +
                  '>{{title}}</div>',
        scope: {
          title: '@',
          page: '@'
        },
        link: ($scope, elem, attrs) => {
          $scope.tabberitems = $(elem).parent().parent().attr('items')
          $scope.isActive = elem.attr('active') === ''
          $scope.active = () => {
            return materialStorage.controllerStorage.nav[
              $scope.tabberitems][attrs.page].item.active
          }
          material.tabber.addItem(
            $scope.tabberitems,
            {
              title: attrs.title,
              page: attrs.page,
              active: $scope.isActive
            }
          )
          $scope.switchToPage = () => {
            $scope.$root.mtrlstorage.nav[
              $scope.tabberitems][attrs.page].switchTo()
          }
        }
      }
    }) // Directive tabberItem
    material_log("All directives added")
    material_log("Registering app finished")
  },
  tabber: {
    addItem: (name, item) => {
      if (!materialStorage.controllerStorage['has_tabber_' + name]) {
        materialStorage.controllerStorage['has_tabber_' + name] = true
        materialStorage.controllerStorage['tabber_' + name] = [item]
      } else {
        materialStorage.controllerStorage['tabber_' + name].push(item)
      }
      if (materialStorage.controllerStorage.nav[name] === undefined) {
        materialStorage.controllerStorage.nav[name] = {}
      }
      materialStorage.controllerStorage.nav[name][item.page] = {
        switchTo: () => {
          $('.material.page.active').removeClass('active')
          $('#mtrlPage' + item.page).addClass('active')
          materialStorage.controllerStorage['tabber_' + name].forEach((e) => {
            e.active = false
          })
          item.active = true
        },
        item: item
      }
    }
  }, // tabber
  button: {
    onClick: (name, func) => {
      materialStorage.controllerStorage['button_click_' + name] = func
    }
  }, // button
  dialog: {
    new: () => {
      return {
        id: materialStorage.controllerStorage.dialogCount++,
        title: "",
        text: "",
        neutralButton: {
          enabled: false
        },
        positiveButton: {
          enabled: true,
          text: "OK"
        },
        negativeButton: {
          enabled: false
        },
        dismissed: false,
        allowCancel: false,
        get setTitle () {
          return (title) => {
            this.title = title
            return this
          }
        },
        get setText () {
          return (text) => {
            this.text = text
            return this
          }
        },
        get dismiss () {
          return () => {
            if (this.dismissed) return
            this.dismissed = true
            $('#materialDialogBg' + this.id).find('.material.dialog')
              .css("opacity", 0)
            setTimeout(() => {
              $('#materialDialogBg' + this.id).removeClass('static')
              setTimeout(() => {
                $('#materialDialogBg' + this.id).remove()
              }, 180)
            }, 40)
          }
        },
        get show () {
          return () => {
            material.dialog.show(this)
            return this
          }
        },
      }
    },
    show: (dialog) => {
      materialStorage.controllerStorage.dialog = dialog
      $('body').append(
        '<div class="material dialog-background" id="materialDialogBg' +
        dialog.id + '">' +
          '<div class="material dialog-container">' +
            '<div class="material dialog">' +
              '<div class="material dialog-title">' +
                dialog.title +
              '</div>' +
              '<div class="material dialog-text">' +
                dialog.text +
              '</div>' +
              '<div class="material dialog-button-container">' +
                (dialog.neutralButton.enabled ?
                '<div class="material dialog-button-left" ' +
                'id="materialDialogNeutralButton' + dialog.id + '">' +
                  dialog.neutralButton.text +
                '</div>' : '') +
                (dialog.positiveButton.enabled ?
                '<div class="material dialog-button-right" ' +
                'id="materialDialogPositiveButton' + dialog.id + '">' +
                  dialog.positiveButton.text +
                '</div>' : '') +
                (dialog.negativeButton.enabled ?
                '<div class="material dialog-button-right" ' +
                'id="materialDialogNegativeButton' + dialog.id + '">' +
                  dialog.negativeButton.text +
                '</div>' : '') +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>'
      )

      $("#materialDialogNeutralButton" + dialog.id).click(() => {
        if (dialog.neutralButton.onclick !== undefined) {
          dialog.neutralButton.onclick()
        }
        dialog.dismiss()
      })
      $("#materialDialogPositiveButton" + dialog.id).click(() => {
        if (dialog.positiveButton.onclick !== undefined) {
          dialog.positiveButton.onclick()
        }
        dialog.dismiss()
      })
      $("#materialDialogNegativeButton" + dialog.id).click(() => {
        if (dialog.negativeButton.onclick !== undefined) {
          dialog.negativeButton.onclick()
        }
        dialog.dismiss()
      })

      // So that we have a nice fade-in animation
      setTimeout(() => {
        $('#materialDialogBg' + dialog.id).addClass('static')
      }, 0)
    }
  }, // dialog
  progress: {
    new: (intermediate, round) => {
      let progress = {
        intermediate: intermediate,
        round: round,
        text: '',
        element: null,
        get setText () {
          return (text) => {
            this.text = text
            if (this.element !== null) {
              this.element.find('.material.progress-text').html(text)
            }
            return this
          }
        },
        get show () {
          return () => {
            $('body').append(
              '<div class="material dialog-background" id="materialProgress' +
              materialStorage.controllerStorage.progressCount + '">' +
                '<div class="material dialog-container">' +
                  '<div class="material dialog small">' +
                    '<div class="material progress-' +
                    (this.round ? "round" : "bar") + '"></div>' +
                    '<div class="material progress-text">' +
                      this.text +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>'
            )
            this.element = $('#materialProgress' +
              materialStorage.controllerStorage.progressCount)
            // So that we have a nice fade-in animation
            setTimeout(() => {
              this.element.addClass('static')
            }, 0)
            materialStorage.controllerStorage.progressCount++
            return this
          }
        },
        get dismiss () {
          return () => {
            this.element.find('.material.dialog').css("opacity", 0)
            setTimeout(() => {
              this.element.removeClass('static')
              setTimeout(() => {
                this.element.remove()
              }, 180)
            }, 40)
          }
        }
      }
      return progress
    }
  }, // progress
  setPrimaryColors: (primary, primaryLight, primaryDark) => {
    if (primary) materialStorage.primaryColor = primary
    if (primaryLight) materialStorage.primaryLightColor = primaryLight
    if (primaryDark) materialStorage.primaryDarkColor = primaryDark
  }, // setPrimaryColors
  setAccentColors: (accent, accentLight, accentDark) => {
    if (accent) materialStorage.accentColor = accent
    if (accentLight) materialStorage.accentLightColor = accentLight
    if (accentDark) materialStorage.accentDarkColor = accentDark
  }, // setAccentColors
  setTheme: (theme) => {
    materialStorage.theme = theme
  }, // setTheme
  onReadyToStyle: (onReady) => {
    materialStorage.onReadyToStyle = onReady
  }, // onReadyToStyle
  applyStyle: () => {
    // Create a variable this way to make it look kinda CSS
    // Looks better
    var styles = [
      ['body', '.material.dialog'], {
        'background-color': materialStorage.theme.background
      },
      ['body', '.material.textfield', '.material.dialog'], {
        color: materialStorage.theme.foreground
      },
      ['.material.actionbar'], {
        'background-color': materialStorage.primaryColor
      },
      ['.material.dialog-button-right',
      '.material.dialog-button-left'], {
        color: materialStorage.accentColor
      },
      ['.material.category-header'], {
        color: materialStorage.accentDarkColor
      },
      ['.material.button.colored',
      '.material.switch.enabled > .material.switch-thumb'], {
        'background-color': materialStorage.accentColor
      },
      ['.material.button.colored:hover'], {
        'background-color': materialStorage.accentLightColor
      },
      ['.material.button.colored:active'], {
        'background-color': materialStorage.accentDarkColor
      },
      ['.material.switch.enabled'], {
        'background-color':
          getRgbaFromHex(materialStorage.accentLightColor, 0.2)
      },
      ['.material.progress-round'], {
        'border-top-color': materialStorage.accentColor
      },
      ['.material.textfield:focus'], {
        'border-bottom-color': materialStorage.accentColor
      },
      ['.material.dialog-button-right:hover',
      '.material.dialog-button-left:hover'], {
        'background-color':
          getRgbaFromHex(materialStorage.theme.foreground, 0.08)
      },
      ['.material.dialog-button-right:active',
      '.material.dialog-button-left:active'], {
        'background-color':
          getRgbaFromHex(materialStorage.theme.foreground, 0.16)
      },
    ]
    // Now generate the styles like a boss
    $('head').append((() => {
      var selectors, style, singleStyle
      var styleString = "<style>"
      for (var i = 0; i < styles.length; i += 2) {
        selectors = styles[i]
        style = styles[i + 1]
        styleString += selectors.join(',') + '{'
        for (singleStyle in style) {
          styleString += singleStyle + ':' + style[singleStyle] + ';'
        }
        styleString += '}'
      }
      styleString += "</style>"
      return styleString
    })())
  }, // applyStyle
  switches: {
    setOnChangeListener: (name, listener) => {
      materialStorage.controllerStorage.switches[name + '_chlistener'] =
        listener
    }
  },
  theme: {
    dark: {
      background: '#212121',
      foreground: '#ffffff'
    },
    light: {
      background: '#ffffff',
      foreground: '#000000'
    }
  }, // theme
} // material

material.registerApp()
