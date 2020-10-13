const access = (options) => {
  const roleMap = {
    0: "admin",
    1: "user",
  };

  return (req, res, next) => {
    const { userId } = req.params;
    const requesterRole = roleMap[req.user.roleid];

    if (options) {
      if (options.roles && options.roles.includes(requesterRole)) {
        next();
      } else if (options.where && options.where(req)) {
        next();
      } else if (
        options.dataOwner &&
        req.user.id === parseInt(options.dataOwner(req))
      ) {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: "You don't have the permission to do this",
        });
      }
    } else {
      next();
    }
  };
};

module.exports = access;
