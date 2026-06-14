const getProfile = async (req, res) => {

    try {
        res.status(200).json({
            message: "Protected profile data",
            user: req.user
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {
    getProfile
};