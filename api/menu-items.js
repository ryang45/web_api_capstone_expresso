const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const sql = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId';
  const values = {$menuItemId: menuItemId};
  db.get(sql, values, (error, issue) => {
    if (error) {
      next(error);
    } else if (issue) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

//retrieve menu items
menuItemsRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
  const values = { $menuId: req.params.menuId};
  db.all(sql, values, (error, menuItems) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({menuItems: menuItems});
    }
  });
});

//create a new menu item
menuItemsRouter.post('/', (req, res, next) => {
  let newItem = req.body.menuItem
  const name = newItem.name,
        description = newItem.description,
        inventory = newItem.inventory,
        price = newItem.price,
        menuId = req.params.menuId;
  const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const menuValues = {$menuId: menuId};
  db.get(menuSql, menuValues, (error, menu) => {
    if (error) {
      next(error);
    } else {
      if (!name || !description || !inventory || !price || !menu) {
        return res.sendStatus(400);
      }

      const sql = 'INSERT INTO MenuItem ' +
                  '(name, description, inventory, price, menu_id)' +
                  'VALUES ' +
                  '($name, $description, $inventory, $price, $menuId)';
      const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: menuId
      };

      db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
            (error, menuItem) => {
              res.status(201).json({menuItem: menuItem});
            });
        }
      });
    }
  });
});

//update a menu item
menuItemsRouter.put('/:menuItemId', (req, res, next) => {
  let updatedItem = req.body.menuItem
  const name = updatedItem.name,
        description = updatedItem.description,
        inventory = updatedItem.inventory,
        price = updatedItem.price,
        menuId = req.params.menuId;
  const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const menuValues = {$menuId: menuId};
  db.get(menuSql, menuValues, (error, menu) => {
    if (error) {
      next(error);
    } else {
      if (!name || !description || !inventory || !price || !menu) {
        return res.sendStatus(400);
      }

      const sql = 'UPDATE MenuItem SET ' +
                  'name = $name, description = $description, ' +
                  'inventory = $inventory, price = $price, ' +
                  'menu_id = $menuId ' +
                  'WHERE MenuItem.id = $menuItemId';
      const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: menuId,
        $menuItemId: req.params.menuItemId
      };

      db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
            (error, menuItem) => {
              res.status(200).json({menuItem: menuItem});
            });
        }
      });
    }
  });
});

//delete a menu item
menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  const sql = `DELETE FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`;

  db.run(sql, (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = menuItemsRouter;
