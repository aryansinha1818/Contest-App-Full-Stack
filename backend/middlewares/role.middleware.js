const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      if (!userRole) {
        return res.status(401).json({ message: "Unauthorized: No role found" });
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: "Access denied" });
      }

      next();
    } catch (error) {
      console.error("Role middleware error:", error.message);
      res
        .status(500)
        .json({ message: "Internal server error in roleMiddleware" });
    }
  };
};

module.exports = roleMiddleware;
