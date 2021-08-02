const forms = require("forms");
const { Product } = require('../models');
const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;

// forms boilerplate

var bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) {
        object.widget.classes = [];
    }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }
    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';
    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};

// create flavors form
const createFlavorForm = () => {
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.maxlength(100)]
        })
    })
}

// create topping form
const createToppingForm = () => {
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.maxlength(100)]
        })
    })
}

// create ingredients form
const createIngredientForm = () => {
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.maxlength(100)]
        })
    })
}

// create dough type form
const createDoughTypeForm = (ingredients) => {

    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.maxlength(100)]
        }),
        'ingredients': fields.string({
            label: "Choose Ingredients Below:",
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.multipleCheckbox(),
            choices: ingredients
        }),

    })
}


// create product form
const createProductForm = (flavors, dough_types, toppings) => {
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'cost': fields.string({
            label: "Cost in Cents (100 = $1)",
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators': [validators.integer()]
        }),
        'description': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.maxlength(500)]
        }),
        "stock": fields.number({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.min(1)],
        }),
        "flavor_id": fields.string({
            label: "Flavor",
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            widget: widgets.select(),
            choices: flavors
        }),
        "dough_type_id": fields.string({
            label: "Dough Type",
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            widget: widgets.select(),
            choices: dough_types
        }),
        "toppings": fields.string({
            label: "Toppings",
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            widget: widgets.multipleSelect(),
            choices: toppings
        }),
        // 'image': fields.string({
        //     required: true,
        //     errorAfterField: true,
        //     widget: forms.widgets.hidden(),
        //     cssClasses: {
        //         label: ["form-label"]
        //     },
        //     'id':'uploadcare',
        //     'role':'uploadcare-uploader'
        // })
    })
};

// user forms
const createUserForm = () => {
    return forms.create({
        "name": fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.maxlength(45)]
        }),
        "email": fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.email(), validators.maxlength(255)]
        }),
        "password": fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.maxlength(32)]
        }),
        "confirm_password": fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.matchField("password")]
        }),
        "dob": fields.date({
            label: "Date of Birth",
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            widget: widgets.date(),
        }),
        "phone": fields.number({
            label: "Contact Number",
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.maxlength(45)]
        }),
        "address": fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.maxlength(255)]
        })
    })
}

const createUpdateUserForm = () => {
    return forms.create({
        "name": fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.maxlength(45)]
        }),
        "email": fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.email(), validators.maxlength(255)]
        }),
        "password": fields.password({
            label: "New Password",
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.maxlength(32)]
        }),
        "confirm_password": fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.matchField("password")]
        }),
        "dob": fields.date({
            label: "Date of Birth",
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            widget: widgets.date(),
        }),
        "phone": fields.number({
            label: "Contact Number",
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.maxlength(45)]
        }),
        "address": fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.maxlength(255)]
        })
    })
}

const createLoginForm = () => {
    return forms.create({
        "email": fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.email()]
        }),
        "password": fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            }
        })
    })
}

//search forms 
const createSearchForm = (flavors, toppings, dough_types) => {
    console.log(flavors, toppings, dough_types)
    return forms.create({
        "name": fields.string({
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            validators: [validators.maxlength(100)]
        }),
        'min_price': fields.string({
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.integer(), validators.min(0)]
        }),
        'max_price': fields.string({
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.integer(), validators.min(0)]
        }),
        "flavor_id": fields.string({
            label: "Flavor",
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            widget: widgets.select(),
            choices: flavors
        }),
        "dough_type_id": fields.string({
            label: "Dough Type",
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            widget: widgets.select(),
            choices: dough_types
        }),
        "toppings": fields.string({
            label: "Toppings",
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            widget: widgets.multipleSelect(),
            choices: toppings
        }),

    })
}

const createOrderUpdateForm = (status) => {
    return forms.create({
        "status_id": fields.string({
            label: "Status",
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"]
            },
            widget: widgets.select(),
            choices: status
        })
    })
}

const createOrderSearchForm = (status) => {
    return forms.create({
        "status_id": fields.string({
            label: "Status",
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ["form-label"],
            },
            widget: widgets.select(),
            choices: status
        }),
        "order_id": fields.number({
            required: false,
            cssClasses: {
                label: ["form-label"],
            },
        }),
        "user_id": fields.number({
            required: false,
            cssClasses: {
                label: ["form-label"],
            },
        }),
        "reciever_name": fields.string({
            required: false,
            cssClasses: {
                label: ["form-label"],
            },
        }),
        "min_cost": fields.number({
            required: false,
            cssClasses: {
                label: ["form-label"],
            },
        }),
        "max_cost": fields.number({
            required: false,
            cssClasses: {
                label: ["form-label"],
            },
        })
    })
}


module.exports = {
    createFlavorForm,
    createToppingForm,
    createProductForm,
    createIngredientForm,
    createDoughTypeForm,
    createUserForm,
    createUpdateUserForm,
    createLoginForm,
    createSearchForm,
    createOrderUpdateForm,
    createOrderSearchForm,
    bootstrapField
};