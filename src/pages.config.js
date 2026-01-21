import Assistant from './pages/Assistant';
import Calendar from './pages/Calendar';
import Dashboard from './pages/Dashboard';
import HealthScanner from './pages/HealthScanner';
import Home from './pages/Home';
import ImageUploader from './pages/ImageUploader';
import MyGarden from './pages/MyGarden';
import PlantingAlerts from './pages/PlantingAlerts';
import Profile from './pages/Profile';
import Upgrade from './pages/Upgrade';
import RequestPlant from './pages/RequestPlant';
import PlantLibrary from './pages/PlantLibrary';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Assistant": Assistant,
    "Calendar": Calendar,
    "Dashboard": Dashboard,
    "HealthScanner": HealthScanner,
    "Home": Home,
    "ImageUploader": ImageUploader,
    "MyGarden": MyGarden,
    "PlantingAlerts": PlantingAlerts,
    "Profile": Profile,
    "Upgrade": Upgrade,
    "RequestPlant": RequestPlant,
    "PlantLibrary": PlantLibrary,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};