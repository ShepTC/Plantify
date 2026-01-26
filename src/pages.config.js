import Assistant from './pages/Assistant';
import Calendar from './pages/Calendar';
import HealthScanner from './pages/HealthScanner';
import Home from './pages/Home';
import ImageUploader from './pages/ImageUploader';
import MyGarden from './pages/MyGarden';
import PlantingAlerts from './pages/PlantingAlerts';
import Profile from './pages/Profile';
import RequestPlant from './pages/RequestPlant';
import Upgrade from './pages/Upgrade';
import PlantLibrary from './pages/PlantLibrary';
import Dashboard from './pages/Dashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Assistant": Assistant,
    "Calendar": Calendar,
    "HealthScanner": HealthScanner,
    "Home": Home,
    "ImageUploader": ImageUploader,
    "MyGarden": MyGarden,
    "PlantingAlerts": PlantingAlerts,
    "Profile": Profile,
    "RequestPlant": RequestPlant,
    "Upgrade": Upgrade,
    "PlantLibrary": PlantLibrary,
    "Dashboard": Dashboard,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};